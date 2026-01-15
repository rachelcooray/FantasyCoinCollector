# Fantasy Coin Collector (Web Version)

A lightweight, browser-based 2D adventure game where you play as a wizard collecting coins in a dark, dangerous dungeon.

## 🎮 How to Play

### Controls
| Action | Desktop (Keyboard) | Mobile (Touch) |
| :--- | :--- | :--- |
| **Move** | **W, A, S, D** | **Left Joystick** |
| **Aim** | **Arrow Keys** | **Right Joystick** |
| **Dash** | **Spacebar** | **⚡ Button** |
| **Fire** | **F** or **Shift** | **🔥 Button** |
| **Pause** | **ESC** | **Pause Button** |

### Rules
1.  **Collect Coins**: Gather Gold Coins to increase your Score.
2.  **Avoid Enemies**: Red "Chaser Skulls" will hunt you down. Don't let them touch you!
3.  **Watch Your Health**: You have **3 Hearts**. If you get hit, you lose a heart. 
4.  **The Campaign**: There are **10 Levels**.
    *   **Level 3**: Ghosts appear.
    *   **Level 4**: Patrollers appear.
    *   **Level 10**: Can you beat the final challenge?
5.  **Tactics**: Use the **Walls** to block Chasers (Red) and Patrollers (Yellow). Ghosts (Purple) can fly through walls!

## 🌟 Features
- **Visuals**: Particles, trails, screen shake, and **Floating Combat Text** (`+10`, `BLOCKED!`).
- **Audio**: Web Audio API with **Pause/Mute Support**.
- **Special Items**: Look out for the rare **Golden Coin** (500 points!).
- **Procedural Maps**: Every time you restart, the walls and obstacles appear in new places.
- **Cross-Platform**: Play with Keyboard on PC or Touch on Mobile/Tablet.

## 📂 File Structure
- **`index.html`**: Main game container, UI overlays, and Mobile Joysticks.
- **`style.css`**: Styling for the dark fantasy theme and responsive layout.
- **`game.js`**: The complete game engine (Physics, AI, Audio, Rendering).

## 🛠️ Customization
Want to tweak the game? Open `game.js` and edit the variables at the top:
- **`player.speed`**: Change movement speed.
- **`player.health`**: Give yourself more (or less) hearts.
- **`COIN_SPAWN_RATE`**: Change how fast coins appear.

## 📜 License
Free to use and modify for learning purposes!
