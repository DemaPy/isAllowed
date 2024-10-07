  function renderAvailableTemplates(templates) {
    return templates.map((template) => {
      const option = document.createElement("option");
      option.value = template.type + "_" + template.name;
      option.textContent = template.name
        ? template.name
        : template.type === "newsletter"
        ? "Newsletter"
        : "Landing";
      return option;
    });
  }
