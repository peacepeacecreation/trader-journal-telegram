
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const numbers = [8, 13, 18, 23]

export function getReplyToMessageId (captionEntities) {
    let itemLink = captionEntities.find((item) => item.type == 'text_link')

    if (itemLink) {
        let uuid = itemLink.url.replace(/.*\//, '')
            .replace(/^\d+\-\s*/, '')

        for (const i of numbers) {
            uuid = uuid.splice(i, 0, '-')
        }

        return uuid;
    }
}
