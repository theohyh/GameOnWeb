# FPS Game with Spell System Architecture (Babylon.js)

This document outlines the recommended architecture for a First-Person Shooter (FPS) game that includes a spell casting system, built using Babylon.js.

## 1. Project Structure

Organize your `src` directory to separate concerns and make the codebase scalable.

```
src/
├── assets/             # 3D models, textures, sounds
├── components/         # Reusable ECS-like components or logic blocks
│   ├── health.ts       # Health management (Player & Enemies)
│   ├── damageable.ts   # Interface/Class for things that take damage
│   └── input.ts        # Input handling logic
├── core/               # Core game systems
│   ├── game.ts         # Main Game loop and initialization
│   ├── scene-manager.ts# Handles scene switching (Menu -> Game)
│   ├── camera-manager.ts# Handles camera switching (FPS <-> Spectator)
│   └── events.ts       # Global event bus (Pub/Sub)
├── entities/           # Game objects
│   ├── player/
│   │   ├── player-controller.ts # Movement & Camera
│   │   └── player-stats.ts      # Health, Mana
│   ├── enemies/
│   │   ├── enemy-base.ts        # Base class for enemies
│   │   └── zombie.ts            # Specific enemy implementation
│   └── spells/
│       ├── spell-manager.ts     # Handles casting, cooldowns
│       ├── spell-base.ts        # Abstract base class for spells
│       └── fireball.ts          # Specific spell implementation
├── ui/                 # User Interface (GUI)
│   ├── hud.ts          # Heads-Up Display (Health, Mana, Crosshair)
│   └── menu.ts         # Main Menu, Pause Menu
└── utils/              # Helper functions
    └── math.ts
```

## 2. Core Systems

### Input System
-   **Goal**: Decouple input detection from game logic.
-   **Implementation**: A `InputManager` class that listens to keyboard/mouse events and maps them to actions (e.g., `Action.Jump`, `Action.Fire1`).
-   **Benefit**: Easy to change keybindings later without rewriting player logic.

### Event System
-   **Goal**: Allow systems to communicate without tight coupling.
-   **Implementation**: A simple Event Bus.
    -   `Events.on('castSpell', (spellId) => { ... })`
    -   `Events.on('castSpell', (spellId) => { ... })`
    -   `Events.emit('enemyDied', enemyId)`
    -   **Bridge Example**:
        -   **Menu**: User clicks "Spectate" -> `Events.emit('switchCamera', 'SPECTATOR')`
        -   **CameraManager**: Listens -> `Events.on('switchCamera', (mode) => this.setActiveCamera(mode))`

## 3. Player Architecture

### Player Controller (`PlayerController`)
-   Handles physics-based movement (WASD + Jump).
-   Controls the Camera (Mouse look).
-   **State Machine**:
    -   `Idle`
    -   `Moving`
    -   `Jumping`
    -   `Casting` (Optional: lock movement while casting?)

### Camera System (New)
-   **Goal**: Support multiple camera modes (FPS, Spectator, Cutscene).
-   **Implementation**:
    -   `CameraManager` class in `core/`.
    -   Holds references to `PlayerCamera` (in `PlayerController`) and a `FreeCamera` (Spectator).
    -   `setActiveCamera(type: 'FPS' | 'SPECTATOR')`:
        -   If 'SPECTATOR': Detach controls from Player, attach to FreeCamera, set `scene.activeCamera = freeCamera`.
        -   If 'FPS': Detach FreeCamera, attach to Player, set `scene.activeCamera = playerCamera`.

### Player Stats (`PlayerStats`)
-   Manages `currentHealth`, `maxHealth`, `currentMana`, `maxMana`.
-   Regenerates mana over time.
-   Emits events when health/mana changes (for UI).

## 4. Spell System Architecture

This is the core unique feature. It should be flexible to allow many different spells.

### `Spell` (Abstract Base Class / Interface)
Every spell should implement this.
-   **Properties**:
    -   `id`: string
    -   `name`: string
    -   `manaCost`: number
    -   `cooldown`: number
    -   `castTime`: number (0 for instant)
    -   `icon`: string (path to image)
-   **Methods**:
    -   `cast(caster: Entity, target: Vector3): void`
    -   `onHit(target: Entity): void`

### `SpellManager`
-   Attached to the Player.
-   Holds the list of learned spells.
-   Tracks current cooldowns.
-   **Logic**:
    1.  Player presses "Q".
    2.  `SpellManager` checks if "Q" spell is ready AND player has enough mana.
    3.  If yes -> Deduct Mana -> Start Cooldown -> Call `spell.cast()`.

### Spell Types
1.  **Projectile** (Fireball):
    -   Spawns a mesh/particle system.
    -   Moves forward every frame.
    -   Detects collision with `Enemy`.
2.  **Hitscan** (Lightning Bolt):
    -   Instant raycast from camera center.
    -   If ray hits enemy -> Apply damage immediately.
3.  **AOE** (Area of Effect - Ice Nova):
    -   Detects all enemies within radius $R$ of player.
    -   Applies effect to all.

## 5. Enemy System

### `EnemyBase`
-   **Navigation**: Uses RecastJS (NavMesh) to follow player.
-   **State Machine**:
    -   `Idle`: Wait for player.
    -   `Chase`: Move towards player.
    -   `Attack`: In range, play animation, deal damage.
    -   `Dead`: Play death animation, disable physics, drop loot.

### Damage Handling
-   Use a `IDamageable` interface.
    ```typescript
    interface IDamageable {
        takeDamage(amount: number): void;
    }
    ```
-   Both `Player` and `Enemy` implement this. Spells just look for this interface on collision.

## 6. UI / HUD

-   **Health & Mana Bars**: Listen to `PlayerStats` events to update width/value.
-   **Spell Bar**: Shows icons of equipped spells.
    -   **Cooldown Overlay**: Darken the icon and show a timer/radial wipe when on cooldown.
-   **Crosshair**: Simple center image.

## 7. Implementation Steps (Recommended)

1.  **Setup**: Clean up project, create folder structure.
2.  **Player**: Get movement and camera feeling good.
3.  **Input**: Set up the `InputManager`.
4.  **Spell Foundation**: Create `Spell` class and `SpellManager`.
5.  **First Spell**: Implement a simple "Fireball" (Projectile).
6.  **Dummy Enemy**: Create a target that prints "Ouch" when hit.
7.  **UI**: Add Mana bar and Cooldown visualization.
8.  **Polish**: Add particles, sounds, and more spells.
