
// Main
(async () => {
  try {
    let res = await fetch(process.env.ACCESSTOKENURL)
    if(!res.ok) {
      console.log(res.status)
    }
    const data = await res.json();
    console.log(data)
  } catch(e) {
    console.log(e)
  }
})();
