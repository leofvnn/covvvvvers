/** Runs before the page paints, so a saved theme or card size never flashes the default first. */
export const themeScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem("theme"),g=localStorage.getItem("grid");if(t==="light"||t==="dark")d.dataset.theme=t;if(g==="small")d.dataset.grid=g;}catch(e){}})();`;
