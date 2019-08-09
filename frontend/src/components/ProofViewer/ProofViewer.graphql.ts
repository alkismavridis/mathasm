export default {
    FETCH_PROOF:`
        query($id: Long!){
            statement(id:$id, depth:3) {
                proof {
                    moves {
                        id:
                        index
                        extBase { id }
                        intBaseId
                        moveType
                        targetId
                        side
                        pos
                        parentId
                        name
                    }
                    bases {
                        id
                        name
                        type
                        left
                        right
                        isBidirectional
                        grade
                    }
                }
            }
        }
    `,

    FETCH_SYMBOLS: `query($ids:[Long!]!) {
        symbols(ids:$ids) { uid, text }
    }`,
}