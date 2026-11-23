(() => {
  "use strict";

  const navLinks = [...document.querySelectorAll(".nav-link")];
  const pages = [...document.querySelectorAll(".page")];
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  function showPage(pageId, updateHistory = false) {
    const target = document.getElementById(pageId);
    if (!target || !target.classList.contains("page")) return;

    pages.forEach(page => {
      const active = page.id === pageId;
      page.classList.toggle("active-page", active);
      page.setAttribute("aria-hidden", String(!active));
    });

    navLinks.forEach(link => {
      const active = link.dataset.page === pageId;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (mainNav) mainNav.classList.remove("open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    }

    if (updateHistory) {
      history.pushState({ page: pageId }, "", `#${pageId}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(link.dataset.page, true);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.classList.contains("nav-link")) return;
    link.addEventListener("click", event => {
      const pageId = link.getAttribute("href").slice(1);
      const page = document.getElementById(pageId);
      if (page && page.classList.contains("page")) {
        event.preventDefault();
        showPage(pageId, true);
      }
    });
  });

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
  }

  function syncPageFromAddress() {
    const pageId = decodeURIComponent(location.hash.replace(/^#/, "")) || "inicio";
    showPage(pageId, false);
  }
  window.addEventListener("popstate", syncPageFromAddress);
  window.addEventListener("hashchange", syncPageFromAddress);

  // Monta automaticamente as 17 redações a partir de redacoes.js.
  const tabsContainer = document.getElementById("essayTabs");
  const panelsContainer = document.getElementById("essayPanels");
  const essays = Array.isArray(window.redacoes) ? window.redacoes : [];

  function activateEssay(id) {
    const selected = String(id);
    tabsContainer.querySelectorAll(".tab").forEach(button => {
      const active = button.dataset.target === selected;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panelsContainer.querySelectorAll(".essay-panel").forEach(panel => {
      const active = panel.id === selected;
      panel.classList.toggle("active-panel", active);
      panel.hidden = !active;
    });
  }

  function makeParagraphs(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "essay-content";
    String(text || "O texto desta redação ainda não foi adicionado.")
      .trim()
      .split(/\n\s*\n/)
      .filter(Boolean)
      .forEach(part => {
        const p = document.createElement("p");
        p.textContent = part.trim();
        wrapper.appendChild(p);
      });
    return wrapper;
  }

  if (tabsContainer && panelsContainer) {
    if (!essays.length) {
      panelsContainer.textContent = "Não foi possível carregar as redações. Confira se o arquivo redacoes.js está na mesma pasta do index.html.";
    } else {
      essays.forEach((essay, index) => {
        const number = Number(essay.id) || index + 1;
        const panelId = `redacao${number}`;

        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = `tab${index === 0 ? " active" : ""}`;
        tab.dataset.target = panelId;
        tab.id = `tab-${panelId}`;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", panelId);
        tab.setAttribute("aria-selected", String(index === 0));
        tab.tabIndex = index === 0 ? 0 : -1;
        tab.textContent = `Redação ${number}`;
        tab.addEventListener("click", () => activateEssay(panelId));
        tab.addEventListener("keydown", event => {
          if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const allTabs = [...tabsContainer.querySelectorAll(".tab")];
          let next = allTabs.indexOf(tab);
          if (event.key === "ArrowRight") next = (next + 1) % allTabs.length;
          if (event.key === "ArrowLeft") next = (next - 1 + allTabs.length) % allTabs.length;
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = allTabs.length - 1;
          allTabs[next].focus();
          activateEssay(allTabs[next].dataset.target);
        });
        tabsContainer.appendChild(tab);

        const panel = document.createElement("article");
        panel.className = `essay-panel${index === 0 ? " active-panel" : ""}`;
        panel.id = panelId;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.hidden = index !== 0;

        const meta = document.createElement("div");
        meta.className = "essay-meta";
        const label = document.createElement("span");
        label.textContent = `REDAÇÃO ${String(number).padStart(2, "0")}`;
        const date = document.createElement("span");
        date.textContent = "REGISTRO ESCOLAR";
        meta.append(label, date);

        const title = document.createElement("h2");
        title.textContent = essay.titulo || `Redação ${number}`;
        const theme = document.createElement("p");
        theme.className = "essay-theme";
        theme.textContent = `Tema: ${essay.tema || essay.descricao || "Não informado"}`;

        panel.append(meta, title, theme, makeParagraphs(essay.texto));

        const reflection = document.createElement("div");
        reflection.className = "reflection";
        const strong = document.createElement("strong");
        strong.textContent = "✦ Sobre esta redação";
        const note = document.createElement("p");
        note.textContent = essay.descricao || essay.tema || "Uma parte da minha trajetória de escrita.";
        reflection.append(strong, note);
        panel.appendChild(reflection);
        panelsContainer.appendChild(panel);
      });
    }
  }

  syncPageFromAddress();
  if (tabsContainer && tabsContainer.querySelector(".tab")) {
    activateEssay(tabsContainer.querySelector(".tab").dataset.target);
  }
})();
