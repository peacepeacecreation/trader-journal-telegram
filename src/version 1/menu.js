export default [
    {
        command: 'start',
        description: 'запустити бота'
    },
    {
        command: 'setting_notion',
        description: 'налаштування таблиці'
    },
    {
        command: 'tutorial',
        description: 'гарячі клавіші'
    },
    {
        command: 'risk',
        description: 'set risk',
    },
]

export const showMenu = (bot, chatId) => {
    bot.telegram.sendMessage(chatId, 'Оберіть дію', {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'блабла'
                    }
                ],
                ['ejfdslk']
            ]
        }
    })
}

export const closeMenu = (bot, chatId) => {
    bot.telegram.sendMessage(chatId, 'Клавіатура закрита', {
        reply_markup: {
            remove_keyboard: true,
        }
    })
}


сtx.reply('fdsfsd', {
    reply_parameters: { message_id: ctx.msg.message_id }
})
