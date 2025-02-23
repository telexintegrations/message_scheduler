const request = require("supertest");
const app = require("../index");
const messageModel = require("../models/Message");

jest.mock("../models/Message");

describe("POST /schedule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should schedule a message with a valid email recipient", async () => {
    const messageData = {
      message: "Send an update to user@example.com at 10 AM tomorrow.",
    };

    messageModel.prototype.save.mockResolvedValueOnce({});

    const response = await request(app).post("/schedule").send(messageData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toMatch(/has been scheduled/);
  });

  it("should assign a default recipient if none is provided", async () => {
    const messageData = {
      message: "Remind me about the meeting at 3 PM.",
    };

    messageModel.prototype.save.mockResolvedValueOnce({});

    const response = await request(app).post("/schedule").send(messageData);

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/default@recipient.com/);
  });

  it("should return an error if content is missing", async () => {
    const messageData = { message: "" };

    const response = await request(app).post("/schedule").send(messageData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Content is required");
  });

  it("should return the original message if content is not a schedule", async () => {
    const messageData = {
      message: "Hello",
    };

    const response = await request(app).post("/schedule").send(messageData);

    expect(response.status).toBe(200);
    expect(response.body.originalMessage).toBe(messageData.message);
  });


});
