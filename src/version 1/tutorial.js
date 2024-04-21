import KEYS from './notionKeys.js'

const notion = `Налаштування обовязкових колонок для таблиці:\n`
    + `\`${KEYS.title}\` - Title. Перша колонка в таблиці.\n`
    + `\`${KEYS.state}\` - Статус позиції. Тип \`Status\`. Містить в собі три значення \`Loss\`, \`BE\` та \`Target\`\n`
    + `\`${KEYS.position}\` - Напрямок позиції. Тип \`Select\`. Містить в собі два значення \`Long\` та \`Short\` \n`
    + `\`${KEYS.risk}\` - Ризик виділений на позицію в % від депозиту. Тип \`Number\`, формат \`Percent\` \n`
    + `\`${KEYS.rr}\` - Співвідношення RR. Тип \`Number\`, формат \`Number\`\n`
    + `\`${KEYS.pair}\` - Пара (EUR/USD). Тип \`Select\`. Може містити безліч значень.\n`
    + `\`${KEYS.fix}\` - Співвідношення RR зафіксованої частини позиції. Тип \`Number\`, формат \`Number\`\n`
    + `\`${KEYS.fix_proc}\` - % Зафіксованої позиції. Тип \`Number\`, формат \`Percent\` \n`
    + `Щоб створити угоду вставте скрін позиції і пропишіть наступну команду l 5 (де l це Long, а 5 це RR)`

const hotKey = `Для запуску потрібно вставити картинку і прописати обовязкові параметри угоди`
    + `Перший символ \`l\` - long та \`s\` - short\n`
    + `Через пробіл наступний набір цифр буде визначати ваш RR\n`
    + `Наприклад \`l 5\` буде означати \`Long 5RR\``
    + `Ризик і пара по дефолту 0.5% та EUR/USD, їх можна змінити в меню або по команді /change_default`

export default { notion, hotKey }


