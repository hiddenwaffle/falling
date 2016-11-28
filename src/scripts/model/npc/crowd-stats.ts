import {Npc} from './npc';
import {NpcLocation, FocusPoint} from './npc-location';
import {GameStateType, gameState} from '../../game-state';

class CrowdStats {

    constructor() {
        //
    }

    start() {
        //
    }

    /**
     * Teleport the NPC somewhere, depending on gameState.
     */
    giveInitialDirection(npc: Npc) {
        switch (gameState.getCurrent()) {
            case GameStateType.Playing:
                this.moveNpcOffScreen(npc);
                break;
            case GameStateType.Intro:
                this.introTeleportOntoWalkway(npc);
                break;
            default:
                console.log('should not get here');
        }

        // TODO: Have it walk somewhere
        npc.addWaypoint(NpcLocation.BuildingMiddle);
    }

    private moveNpcOffScreen(npc: Npc) {
        let offscreen = Math.floor(Math.random() * 2);
        if (offscreen == 0) {
            npc.teleportTo(NpcLocation.OffLeft);
        } else {
            npc.teleportTo(NpcLocation.OffRight);
        }
    }

    private introTeleportOntoWalkway(npc: Npc) {
        let walkway = Math.floor(Math.random() * 3); // 3 = Total number of Building* locations
        switch (walkway) {
            case 0: // BuildingLeft
                this.introTeleportOntoBuildingLeft(npc);
                break;
            case 1: // BuildingRight
                this.introTeleportOntoBuildingRight(npc);
                break;
            case 2: // BuildingMiddle
                this.introTeleportOntoBuildingMiddle(npc);
                break;
            default:
                console.log('should not get here');
        }
    }

    private introTeleportOntoBuildingLeft(npc: Npc) {
        npc.teleportTo(NpcLocation.BuildingLeft);
        let direction = Math.floor(Math.random() * 2);
        if (direction === 0) { // Go left
            npc.addWaypoint(NpcLocation.OffLeft);
        } else { // Go right
            npc.addWaypoint(NpcLocation.BuildingMiddle);
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    private introTeleportOntoBuildingRight(npc: Npc) {
        npc.teleportTo(NpcLocation.BuildingRight);
        let direction = Math.floor(Math.random() * 2);
        if (direction === 0) { // Go left
            npc.addWaypoint(NpcLocation.BuildingMiddle);
            npc.addWaypoint(NpcLocation.OffLeft);
        } else { // Go right
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    private introTeleportOntoBuildingMiddle(npc: Npc) {
        npc.teleportTo(NpcLocation.BuildingRight);
        let direction = Math.floor(Math.random() * 2);
        if (direction === 0) { // Go left
            npc.addWaypoint(NpcLocation.OffLeft);
        } else { // Go right
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    /**
     * Tell a waiting NPC what to do, depending on gameState.
     */
    giveDirection(npc: Npc) {
        // TODO: Determine what the npc should do now.
        npc.standFacing(FocusPoint.BuildingRight, 20000);
    }
}
export const crowdStats = new CrowdStats();