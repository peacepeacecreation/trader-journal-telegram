import KEYS from '../message/keys.js'

export function rejectCommand(text) {
    const [
        position,
        rr,
    ] = text.split(' ')

    return {
        pair: 'EUR/USD',
        position: KEYS[position],
        rr,
        risk: 0.5,
    }
}
