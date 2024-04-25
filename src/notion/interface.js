
export function getDataResponse(data) {
    return {
        id: data.id,
        database_id: data.parent.database_id,
        url: data.url,
        title: data.properties.Name.title[0].plain_text,
        state: data.properties['State'].status.name,
        position: data.properties['Position'].select?.name,
        risk: data.properties['Risk %'].number,
        rr: data.properties['Target'].number,
        pair: data.properties['Pair'].select?.name,

        fix: data.properties['Fix'].number,
        fix_proc: data.properties['Fix %'].number,
        profit: data.properties['Profit'] && data.properties['Profit'].formula.number
    }
}
