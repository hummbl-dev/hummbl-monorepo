export const IN1_CONSTANTS = {
  MODEL_ID: 'IN1',
  MODEL_NAME: 'Inversion Thinking',
  DESCRIPTION: 'Approach problems by considering the opposite of the desired outcome',
  VERSION: '1.0.0',
  KEY_CHARACTERISTICS: [
  "Identifies what not to do",
  "Prevents mistakes by inversion",
  "Focuses on avoiding failure",
  "Considers worst-case scenarios",
  "Highlights potential pitfalls"
],
  RELATED_MODELS: [
  "P1",
  "ST1",
  "ST2"
],
  EXAMPLE: {
  "problem": "How to be happy?",
  "traditionalApproach": "Pursue happiness directly",
  "modelApproach": "Identify what makes you unhappy and eliminate those things"
}
} as const;