  async function render() {
    if (!CANI) return
    if (!getState("country")) return;
    const templateToRender = getState("template");
    if (!templateToRender) {
      Toastify({
        text: "Select template.",
        escapeMarkup: false,
        duration: 3000,
      }).showToast();
      return;
    }

    const selectedCampaign = getState("selectedCampaign");
    const localStorageProducts = localStorage.getItem("products");
    const parsedProducts = localStorageProducts
      ? JSON.parse(localStorageProducts)
      : [];

    const campaignProducts = parsedProducts.find(
      (item) => item.campaign_id === selectedCampaign.startId
    );
    const country = getState("country");
    const translations = getState("translations");
    const ids = getState("ids");
    const handlers = new TemplateHandlers({
      translations,
      country,
      products: campaignProducts?.products || [],
    });

    if (templateToRender.tableQueries.length > 0) {
      try {
        setState("loading", true);
        const translationsResult = await fetchTranslations({
          tableQueries: templateToRender.tableQueries,
        });
        setState("loading", false);
        const queries = {};
        for (const translation of translationsResult) {
          queries[translation.name] = translation.data;
        }
        setState("queries", queries);
      } catch (error) {
        setState("loading", false);
        Toastify({
          text: error,
          escapeMarkup: false,
          duration: 3000,
        }).showToast();
        return;
      }
    }
    // addParams check the link on "query" key and execute with origin.
    const links = addParams({
      links: templateToRender.links,
    });

    try {
      const html = await templateToRender.template({
        ...state,
        ...templateToRender,
        background: templateToRender.background || "#ffffff",
        country,
        origin: state.shop,
        id: ids[country],
        type: templateToRender.type,
        getProductById: handlers.getProductById,
        getCategory: handlers.getCategory,
        getField: handlers.getField,
        links: links,
      });

      const withStylesOrNo =
        "css" in templateToRender
          ? `<style>${templateToRender.css}</style>` + html
          : html;

      const wrappedHtml = templateToRender.wrapper
        ? wrapTemplate(templateToRender.wrapper, {
            style: templateToRender.css ?? "",
            html: html,
          })
        : withStylesOrNo;
      setState("html", wrappedHtml);

      if (withStylesOrNo.includes("undefined")) {
        if (confirm("Do you want to render template with undefined value?")) {
          return (root.innerHTML = withStylesOrNo);
        } else {
          Toastify({
            text: "Error rendering. HTML code has undefined value.",
            escapeMarkup: false,
            duration: 3000,
          }).showToast();
        }
      } else {
        root.innerHTML = withStylesOrNo;
      }
    } catch (error) {
      const erros = JSON.parse(localStorage.getItem("errors") || "[]");
      localStorage.setItem(
        "errors",
        JSON.stringify([
          ...erros,
          {
            ...state,
            message: error.message || "Unknown reason",
            timestamp: Date.now(),
          },
        ])
      );
      Toastify({
        text: "Please check console. " + error.message,
        escapeMarkup: false,
        duration: 3000,
      }).showToast();
    }
  }
