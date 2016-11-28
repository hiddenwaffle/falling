export const enum NpcState {
    /**
     * NPC is in-transit to a waypoint.
     */
    Walking,

    /**
     * NPC completed an action and is now waiting for manager to tell it what to do.
     * NPC should have fired an event that notifies the manager that it is waiting.
     */
    WaitingForCommand,

    /**
     * NPC is standing and reacting to the game.
     */
    Standing
}
