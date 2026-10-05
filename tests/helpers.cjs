async function show(page, hash) {
  const target={tools:'notes',experiments:'latest',memory:'view-memory'}[hash]||hash;
  await page.evaluate(value=>{location.hash=value;},hash);
  await page.locator('#'+target).waitFor({state:'visible'});
}
module.exports={show};
