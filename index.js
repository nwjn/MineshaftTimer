let playerTimes = {};

// Tracks if a player leaves the mineshaft
const playerWarpout = register('chat', (player) => {
  if (!playerTimes[player]) return;

  playerTimes[player] = (Date.now() - playerTimes[player]) / 1000
}).setCriteria(" » ${player} is traveling to ${*} FOLLOW").unregister()

// Sends results if the lobby closes
const lobbyClosed = register('chat', () => {
  sendResults();
}).setCriteria("The mineshaft entrance has caved in... it doesn't look like anyone else will be able to get in here.").unregister()

// Sends results if you warpout before it closes
const earlyWarpout = register('chat', () => {
  sendResults();
}).setCriteria("Sending to server ${*}...").unregister();

// Tracks players you warp into your mineshaft
register("chat", (player) => {
  // Returns if warping to non-Mineshaft instance gamemode
  const world = TabList.getNames()?.find(tab => tab?.match(/(Area|Dungeon)/g))?.removeFormatting()?.split(": ")?.slice(-1);
  if (world != "Mineshaft") return;

  // Adds player's name and time to object
  player = player.split(" ").slice(-1)
  playerTimes[player] = Date.now()
  
  // If this is the first player to warp in, register all triggers
  playerWarpout.register()
  lobbyClosed.register()
  earlyWarpout.register()
}).setCriteria("⚔ ${player} warped to your instance")

// Calculates and formats each player's time that warped-out
function sendResults() {
  let arrayTimes = []
  for (let key in playerTimes) {
    if (!playerTimes[key] || playerTimes[key] > 60000) continue;
    arrayTimes.push([key, playerTimes[key]])
  }

  // Sorts the players by highest to lowest time (negative while loop reverts it back to lowest to highest)
  arrayTimes.sort((a, b) => b[1] - a[1])
  
  ChatLib.chat("&b▬▬▬▬▬▬▬▬MineshaftTimer▬▬▬▬▬▬▬▬")
  ChatLib.chat(`&eTracked Shaft Times:`)
  let i = arrayTimes.length; while (i--) {
    const player = arrayTimes[i]
    ChatLib.chat(` &3${ player[0] }:&r ${ player[1] }&es`)
  }
  ChatLib.chat("&b▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")
  
  // Unregisters triggers and resets all variables
  playerTimes = {}
  playerWarpout.unregister()
  lobbyClosed.unregister()
  earlyWarpout.unregister()
}



// Tracks your own mineshaft time
let enter;

// Resets on leave
const reset = register("chat", () => {
  if (!enter) return
  ChatLib.chat(`&b[MineshaftTimer] &3You took&r ${ ((Date.now() - enter) / 1000) }&es`)

  enter = false
  reset.unregister()
}).setCriteria("Sending to server ${*}...").unregister();

// Breaks if nicked or a mod changes your name in chat
register("chat", (player) => {
  if (player != Player.getName()) return
  enter = Date.now();
  reset.register()
}).setCriteria(" ⛏ ${player} entered the mineshaft!");
