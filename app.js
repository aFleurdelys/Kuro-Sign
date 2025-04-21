
// Main
(async () => {
  try {
    console.log(process.env.TOKEN)
    console.log(process.env.ACCESSTOKENURL)
  } catch(e) {
    console.log(e)
  }
})();
