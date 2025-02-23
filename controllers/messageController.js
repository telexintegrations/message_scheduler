const messageModel = require("../models/Message");
const formatMessage = require("../utils/gemini");

const url = "https://message-scheduler-na2x.onrender.com";

const scheduleMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }
    const processedMessage = await formatMessage(message);

     if (processedMessage.error) {
       return res.status(400).json({ error: processedMessage.error });
     }

    if (!processedMessage.recipient) {
      return res.status(200).json(processedMessage);
    }


    if (!processedMessage.content) {
      return res.status(200).json(processedMessage);
    }


    if (
      !processedMessage.sendAt ||
      isNaN(new Date(processedMessage.sendAt).getTime())
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const storedDateUTC = new Date(processedMessage.sendAt); 

    if (isNaN(storedDateUTC.getTime())) {
      console.error("Error: Invalid date format ->", processedMessage.sendAt);
      return res.status(400).json({ message: "Invalid date format" });
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    
    const scheduledDateLocal = new Date(
      storedDateUTC.toLocaleString("en-US", { timeZone: userTimeZone })
    );

  

    const humanReadableTime = scheduledDateLocal.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: userTimeZone,
    });

    const confirmationMessage = `Your message ('${processedMessage.content}') to ('${processedMessage.recipient}') has been scheduled for ${humanReadableTime}.`;


    const newMessage = new messageModel({
      content: processedMessage.content ?? processedMessage.originalMessage,
      recipient: processedMessage.recipient,
      sendAt: storedDateUTC.toISOString(),
      sent: false,
    });

    await newMessage.save();

    res.status(200).json({
      message: confirmationMessage,
      status: "success",
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const integrationConfig = async (req, res) => {
  const integrationData = {
    data: {
      date: {
        created_at: "2025-02-22",
        updated_at: "2025-02-22",
      },
      descriptions: {
        app_description: "Schedule messages to be sent at a later time",
        app_logo: "https://i.ibb.co/0V1h40vP/image1-0.jpg",
        app_name: "Message Scheduler",
        app_url: url,
        background_color: "#fff",
      },
      integration_category: "Communication & Collaboration",
      integration_type: "modifier",
      is_active: true,
      key_features: [
        "Task reminders which is helpful for internal team communication",
        "Time-Sensitive communication between users to ensure that messages are delivered at the best time",
      ],
      permissions: {
        monitoring_user: {
          always_online: true,
          display_name: "Message Scheduler",
        },
      },
      settings: [
        {
          label: "Scheduled message",
          type: "text",
          required: true,
          default: "",
        },
      ],
      target_url: `${url}/schedule`,
    },
  };

  res.json(integrationData);
};

module.exports = {
  scheduleMessage,
  integrationConfig,
};
