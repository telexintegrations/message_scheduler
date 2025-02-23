const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const moment = require("moment-timezone");

let genAI;

const formatMessage = async (message) => {
  try {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDate = new Date().toISOString().split("T")[0];

    const prompt = `
You are an AI that extracts scheduling details from messages.
If the message is about scheduling, return this JSON format:

{
  "content": "The actual message to be sent",
  "recipient": "A valid email (if missing, infer from message or use 'default@recipient.com')",
  "sendAt": "A valid future UTC date-time in YYYY-MM-DD HH:mm:ss UTC"
}

**Rules:**
1. Extract the recipient’s **exact email** from the message **without changing it**.
2. If the email is missing, infer it but do NOT modify an explicitly mentioned email.
3. Assume the provided time is in the user's local timezone: **${userTimeZone}**.
4. Convert the mentioned time **to UTC** before returning it as **sendAt**.
5. If no date is given, assume it is **today** at the mentioned time.
6. **If the time is already in the past, schedule it for tomorrow.**
7. If no time is given, schedule it for **the next hour**.
8. Convert **sendAt UTC** back into **the user's local timezone** for confirmation.
9. **If no recipient is found, use 'default@recipient.com'.**.

**Current Date:** ${currentDate} (YYYY-MM-DD)

Also, generate a confirmation message:
{
  "confirmationMessage": "Your message ('{content}') to ('{recipient}') has been scheduled for {sendAt} UTC, which is {sendAtLocal} in your local timezone."
}

**If the message is NOT about scheduling, return:**
{
  "originalMessage": "<user's original message>"
}

<userMessage>${message}</userMessage>
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisText = response.text();

    const firstJsonMatch = analysisText.match(/\{[\s\S]*?\}/);

    if (!firstJsonMatch) {
      console.error("No valid JSON found in AI response");
      return { originalMessage: message };
    }

    try {
      const parsedResponse = JSON.parse(firstJsonMatch[0].trim());

      if (!parsedResponse.content) {
        return parsedResponse;
      }

      if (!parsedResponse.recipient) {
        parsedResponse.recipient = "default@recipient.com";
      }

      if (!parsedResponse.sendAt) {
        parsedResponse.sendAt = new Date();
      }


      const sendAtLocal = moment.tz(
        parsedResponse.sendAt,
        "YYYY-MM-DD HH:mm:ss",
        userTimeZone
      );

      if (!sendAtLocal.isValid()) {
        console.error("Invalid date format received:", parsedResponse.sendAt);
        return { error: "Invalid date format" };
      }

      const sendAtUTC = sendAtLocal.utc();

      const humanReadableTime = sendAtUTC
        .clone()
        .tz(userTimeZone)
        .format("dddd, MMMM D, YYYY at h:mm A");

      return {
        content: parsedResponse.content,
        recipient: parsedResponse.recipient,
        sendAt: sendAtUTC.toISOString(),
        confirmationMessage: `Your message ('${parsedResponse.content}') to ('${parsedResponse.recipient}') has been scheduled for ${humanReadableTime}.`,
      };
    } catch (error) {
      console.error("JSON Parsing Error:", error);
      console.error("Faulty AI Response:", analysisText);
      return { originalMessage: message };
    }
  } catch (error) {
    console.error("Error formatting message:", error);
    return { originalMessage: message };
  }
};

module.exports = formatMessage;
