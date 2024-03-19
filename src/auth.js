import { Client } from '@notionhq/client'
import config from 'config'
import { create } from './notion.js'

const nGeneral = new Client({
    auth: config.get('NOTION_KEY'),
})

function getPlainText(data) {
    if (data.length > 0) return data[0].plain_text
}

function getSecretKey(response) {
    if (!response) return null

    return getPlainText(response.properties['SECRET_KEY'].rich_text)
}

function getDBID(response) {
    if (!response) return null

    return getPlainText(response.properties['DB_ID'].title)
}

export default {
    async notion(username, auth) {
        if (!auth) auth = await getSecretKey(await this.getDB(username))
        const notion = new Client({ auth })

        return notion
    },
    async getDB(username) {
        const db = await nGeneral.databases.query({ database_id: config.get('NOTION_DB_ID') })
        return db.results.find((item) => item.properties.Author.rich_text[0].plain_text == username)
    },
    async signed(username) {
        try {
            return await this.getDB(username)
        } catch (e) {
            console.log('connection DB get key ', e.message)
        }
    },
    async createSecretKey(username, key) {
        try {
            const notion = await this.notion(username, key)
            let user = await notion.users.me({})

            await nGeneral.pages.create({
                parent: { database_id: config.get('NOTION_DB_ID') },
                properties: {
                    SECRET_KEY: {
                        rich_text: [{
                            text: { content: key }
                        }]
                    },
                    Author: {
                        rich_text: [{
                            text: { content: username }
                        }]
                    },
                }
            })

            return {
                valid: true,
                message: `Secret Key ${user.name} збережено. Введіть DB ID.`,
            }
        } catch (e) {
            return {
                valid: false,
                message: e.message
            }
        }
    },

    checkDBID(db) {
        if (!getDBID(db)) return false

        return true
    },
    async createDBID(username, text) {
        try {
            const page = await this.getDB(username)
            const notion = await this.notion(username, getSecretKey(page))

            const databaseId = await notion.databases.query({ database_id: text })

            await nGeneral.pages.update({
                page_id: page.id,
                properties: {
                    DB_ID: {
                        title: [{
                            text: { content: text }
                        }]
                    },
                }
            })

            return {
                valid: true,
                message: 'DB ID збережено'
            }
            //if (!getDBID(db))
/*
            return */
        } catch (e) {
            return {
                valid: false,
                message: e.message
            }
        }
    },
    async create(username, params) {
        const page = await this.getDB(username)
        const notion = await this.notion(username, getSecretKey(page))
        return await create(notion, getDBID(page), params)
    },
}
