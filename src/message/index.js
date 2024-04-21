import KEYS from './keys.js'

export function template (res) {
    //console.log(res)
    let content = `[№ ${res.title}](${res.url})\n`
        + `*${res.pair} - ${KEYS[res.position]}* ${KEYS[res.state]}\n`
        + `RR: *${res.rr}*\n`
        + `Risk: *${(res.risk * 100)}%*\n`

    if (res.fix) {
        content += `Fix ${res.fix_proc * 100}% (RR: ${res.fix}) \n`
    }

    content += `\nResult: ${res.rr * res.risk * 100}%`

    return content
}
