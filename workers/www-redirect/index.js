// Worker: naroa.online/* & www.naroa.online/* → 301 a https://naroagutierrezgil.com/ conservando path y query.
export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(`https://naroagutierrezgil.com${url.pathname}${url.search}`, 301);
  },
};

