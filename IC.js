function initCampaigns(campaigns) {
    const now = new Date();
    const campaigns_nodes = [];
    const campaigns_to_alarm = [];

    for (const campaign of campaigns) {
      // Handle campaign archive
      if (campaign.isArchive) {
        continue;
      }

      // Handle campaign to alarm
      if ("date" in campaign) {
        const date = new Date(campaign.date);
        const difference = date - now;
        if (difference > 0) {
          const diffDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          if (
            diffDays <= (config?.alarm_days || 7) &&
            campaign.alarm.isActive
          ) {
            campaigns_to_alarm.push(campaign);
          }
        }
      }

      const option = document.createElement("option");
      option.value = campaign.startId;
      option.textContent = campaign.name + " - " + campaign.date;
      campaigns_nodes.push(option);
    }

    for (const campaign of campaigns_to_alarm) {
      alert(
        campaign.alarm.description + " " + campaign.name + " " + campaign.date
      );
    }

    return campaigns_nodes;
  }
