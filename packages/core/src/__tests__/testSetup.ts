import Log from '../logger'
import pino from 'pino'
Log.setLogger(pino({ level: 'silent' }))
