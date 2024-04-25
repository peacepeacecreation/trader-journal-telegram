import KEYS from './keys.js'

export function template (res) {
    let content = `[№ ${res.title}](${res.url})\n`

    if (res.pair) content += `*${res.pair}*`
    if (res.position) content += `- *${KEYS[res.position]}* ${KEYS[res.state]}\n`
    if (res.rr) content += `RR: *${res.rr}*\n`
    if (res.risk) content += `Risk: *${(res.risk * 100)}%*\n`

    if (res.fix) {
        content += `Fix ${res.fix_proc * 100}% (RR: ${res.fix}) \n`
    }

    //content += `\nResult: ${res.rr * res.risk * 100}%`

    return content
}
