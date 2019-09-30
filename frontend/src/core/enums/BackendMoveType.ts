/** Must be in sync with LogicMove.kt */
enum BackendMoveType {
    START = 1,
    SAVE = 2,
    REPLACE_ALL = 3,
    REPLACE_LEFT = 4,
    REPLACE_RIGHT = 5,
    ONE_IN_LEFT = 6,
    ONE_IN_RIGHT = 7
}

export default BackendMoveType;