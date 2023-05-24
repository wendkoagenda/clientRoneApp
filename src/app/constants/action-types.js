/**
 * Enum for action types in dispatch process.
 * @readonly
 * @enum {{name: string, hex: number}}
 */
const actionTypesDispatchProcess = Object.freeze({
    ASSIGN: 1,
    UPDATE: 2,
    CANCEL: 3,
    CONFIRMED: 4,
    NOTIFIED: 5,
    COMPLETED: 6
});

export default actionTypesDispatchProcess;