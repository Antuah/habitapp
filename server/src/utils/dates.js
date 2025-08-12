const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(tz);

const TIMEZONE = process.env.TZ || 'America/Mexico_City';

function todayMX() {
  return dayjs().tz(TIMEZONE).format('YYYY-MM-DD');
}

function toMXDateFromAmazon(amazonDate) {
  if (!amazonDate || amazonDate === 'PRESENT_REF') return todayMX();
  // Formatos comunes de AMAZON.DATE: YYYY-MM-DD, YYYY-MM, YYYY, XXXX-WXX
  if (/^\d{4}-\d{2}-\d{2}$/.test(amazonDate)) return amazonDate; // ya viene completa
  // Si viene algo distinto (mes o semana), para simple demo usamos hoy
  return todayMX();
}

module.exports = { TIMEZONE, todayMX, toMXDateFromAmazon };