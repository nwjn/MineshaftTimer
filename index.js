let playerTimes = {};

// Tracks if a player leaves the mineshaft
const playerWarpout = register('chat', (player) => {
  if (!playerTimes[player] || playerTimes[player] < 1000000) return;

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
  
  // Sorts the players by highest to lowest time (negative while loop reverts it back to lowest to highest)
  const ref = Object.entries(playerTimes)
  const finished = ref.filter(e => e[1] < 1000000).sort((a, b) => b[1] - a[1])
  const unfinished = ref.filter(e => e[1] >= 1000000).sort((a, b) => a[1] - b[1])
  
  ChatLib.chat("&b▬▬▬▬▬▬▬▬MineshaftTimer▬▬▬▬▬▬▬▬")
  finished && ChatLib.chat(`&aCompleted Shaft Times:`)
  let i = finished.length; while (i--) {
    const [name, time] = [finished[i][0], finished[i][1]]
    ChatLib.chat(` &3${ name }:&r ${ time }&es`)
  }
  (finished && unfinished) && ChatLib.chat("&b▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")
  unfinished && ChatLib.chat(`&cUnfinished Shaft Times:`)
  i = unfinished.length; while (i--) {
    const [name, time] = [unfinished[i][0], unfinished[i][1]]
    ChatLib.chat(` &3&l${name}:&f&l ≥ ${(Date.now() - time) / 1000}&es`)
  }
  ChatLib.chat("&b▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")
  
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