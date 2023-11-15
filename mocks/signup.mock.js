// Replace 'YOUR_SERVER_URL' with the actual server URL
const serverUrl = 'http://localhost:3000';

// Function to generate a random string
const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

// Function to generate a random date
const generateRandomDate = () => {
  const year = Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
};

// Function to send a registration request
const registerUser = async () => {
  const signUpData = {
    email: `user${generateRandomString()}@example.com`,
    password: 'password123',
    name: 'John Doe',
    birthDate: generateRandomDate(),
    nickname: generateRandomString(),
    about: 'I love programming!',
    gender: 'MALE',
  };

  try {
    const response = await fetch(`${serverUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signUpData),
    });

    const responseJson = await response.json();

    console.log(
      `User registered successfully. Response: ${JSON.stringify(responseJson)}`,
    );
  } catch (error) {
    console.error(`Error registering user: ${error.message}`);
  }
};

// Send 50 registration requests
const numberOfRequests = 50;

for (let i = 0; i < numberOfRequests; i++) {
  registerUser();
}
