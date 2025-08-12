const express = require('express');
const router = express.Router();

const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

const Users = require('../services/users.service');
const Habits = require('../services/habits.service');
const { toMXDateFromAmazon } = require('../utils/dates');

function getAlexaUserId(handlerInput) {
  const sys = handlerInput.requestEnvelope?.context?.System;
  const ses = handlerInput.requestEnvelope?.session;
  return sys?.user?.userId || ses?.user?.userId || 'anon';
}

// Helpers para slots
function slotVal(handlerInput, slotName) {
  try {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const slot = slots[slotName];
    return slot?.value || null;
  } catch (_) { return null; }
}

const LaunchRequestHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'LaunchRequest';
  },
  async handle(h) {
    const speakOutput = 'Bienvenido a Mis Hábitos. Puedes decir: crea hábito agua con meta ocho, o registra cinco de agua.';
    return h.responseBuilder.speak(speakOutput).reprompt('¿Qué quieres hacer?').getResponse();
  }
};

const CreateHabitIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'CreateHabitIntent';
  },
  async handle(h) {
    const alexaUserId = getAlexaUserId(h);
    const user = await Users.ensureUser(alexaUserId);

    const HabitName = slotVal(h, 'HabitName');
    let GoalType = slotVal(h, 'GoalType');
    const DailyGoal = slotVal(h, 'DailyGoal');

    if (!HabitName) {
      return h.responseBuilder.speak('¿Cómo se llama el hábito?').reprompt('Dime el nombre del hábito.').getResponse();
    }

    // Normalizar goal_type
    GoalType = (GoalType || '').toLowerCase();
    let goal_type = 'bool';
    if (['conteo', 'count', 'cantidad', 'numero', 'repeticiones'].includes(GoalType)) goal_type = 'count';

    const daily_goal = goal_type === 'count' ? Number(DailyGoal || 0) || null : null;

    const exists = await Habits.findHabitByName(user.id, HabitName);
    if (exists) {
      return h.responseBuilder.speak(`El hábito ${HabitName} ya existe.`).getResponse();
    }

    await Habits.createHabit(user.id, { name: HabitName, goal_type, daily_goal });
    const msg = goal_type === 'count' && daily_goal
      ? `Listo. Creé el hábito ${HabitName} con meta diaria de ${daily_goal}.`
      : `Listo. Creé el hábito ${HabitName}.`;
    return h.responseBuilder.speak(msg).getResponse();
  }
};

const LogHabitIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'LogHabitIntent';
  },
  async handle(h) {
    const alexaUserId = getAlexaUserId(h);
    const user = await Users.ensureUser(alexaUserId);

    const HabitName = slotVal(h, 'HabitName');
    const Amount = Number(slotVal(h, 'Amount') || 1);
    const When = slotVal(h, 'When'); // AMAZON.DATE

    if (!HabitName) {
      return h.responseBuilder.speak('¿Qué hábito quieres marcar?').reprompt('Dime el nombre del hábito.').getResponse();
    }

    const habit = await Habits.findHabitByName(user.id, HabitName);
    if (!habit) {
      return h.responseBuilder.speak(`No encontré el hábito ${HabitName}. Puedes decir: crea hábito ${HabitName}.`).getResponse();
    }

    const date = toMXDateFromAmazon(When);
    await Habits.logHabit(habit.id, date, Amount);

    const amountText = habit.goal_type === 'count' ? `${Amount}` : 'hecho';
    return h.responseBuilder.speak(`Registré ${amountText} en ${HabitName} para el ${date}.`).getResponse();
  }
};

const SummaryIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'SummaryIntent';
  },
  async handle(h) {
    const alexaUserId = getAlexaUserId(h);
    const user = await Users.ensureUser(alexaUserId);
    const today = new Date().toISOString().slice(0, 10);
    const rows = await Habits.summary(user.id, today, today);

    if (!rows.length) return h.responseBuilder.speak('Aún no tienes hábitos. Di: crea hábito agua.').getResponse();

    const parts = rows.map(r => {
      if (r.goal_type === 'count' && r.daily_goal) return `${r.name}: ${r.total}/${r.daily_goal}`;
      return `${r.name}: ${r.total > 0 ? 'hecho' : 'pendiente'}`;
    });

    return h.responseBuilder.speak(`Resumen de hoy: ${parts.join(', ')}.`).getResponse();
  }
};

const ListHabitsIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'ListHabitsIntent';
  },
  async handle(h) {
    const alexaUserId = getAlexaUserId(h);
    const user = await Users.ensureUser(alexaUserId);
    const rows = await Habits.getHabits(user.id);
    if (!rows.length) return h.responseBuilder.speak('No tienes hábitos aún. Di: crea hábito agua.').getResponse();
    const names = rows.map(r => r.name).join(', ');
    return h.responseBuilder.speak(`Tus hábitos: ${names}.`).getResponse();
  }
};

const DeleteHabitIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'DeleteHabitIntent';
  },
  async handle(h) {
    const alexaUserId = getAlexaUserId(h);
    const user = await Users.ensureUser(alexaUserId);
    const HabitName = slotVal(h, 'HabitName');
    if (!HabitName) return h.responseBuilder.speak('¿Cuál hábito quieres borrar?').reprompt('Dime el nombre del hábito.').getResponse();

    const ok = await Habits.deleteHabit(user.id, HabitName);
    if (!ok) return h.responseBuilder.speak(`No encontré ${HabitName}.`).getResponse();
    return h.responseBuilder.speak(`Listo, eliminé ${HabitName}.`).getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(h) {
    const speak = 'Puedes decir: crea hábito agua con meta ocho, o registra cinco de agua, o resumen de hoy.';
    return h.responseBuilder.speak(speak).reprompt('¿Qué quieres hacer?').getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.CancelIntent' || Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(h) {
    return h.responseBuilder.speak('Adiós.').getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(h) {
    return h.responseBuilder.speak('No entendí. Intenta: crea hábito agua, o registra cinco de agua.').reprompt('¿Qué deseas hacer?').getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(h) { return Alexa.getRequestType(h.requestEnvelope) === 'SessionEndedRequest'; },
  handle(h) { return h.responseBuilder.getResponse(); }
};

const ErrorHandler = {
  canHandle() { return true; },
  handle(h, err) {
    console.error('Alexa Error:', err);
    return h.responseBuilder.speak('Perdón, hubo un error. Intenta de nuevo.').getResponse();
  }
};

const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    CreateHabitIntentHandler,
    LogHabitIntentHandler,
    SummaryIntentHandler,
    ListHabitsIntentHandler,
    DeleteHabitIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  // .withSkillId(process.env.ALEXA_SKILL_ID) // opcional en dev
  .addErrorHandlers(ErrorHandler)
  .create();

const adapter = new ExpressAdapter(skill, false, false); // sin verificación en dev

router.post('/', adapter.getRequestHandlers());

module.exports = router;