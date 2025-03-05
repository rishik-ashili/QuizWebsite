# Secure Quiz Platform 🚀📝

## Overview

Secure Quiz Platform is a web-based application that allows users to create, manage, and attempt quizzes with advanced security features. The platform provides a robust environment for quiz creation, participation, and result tracking.

## Features 🌟

### For Quiz Creators
- Create quizzes with custom time limits
- Upload quiz questions via CSV
- Secure authentication
- View quiz attempts and participant scores
- Anti-cheating mechanisms

### For Quiz Participants
- Attempt quizzes with a unique quiz ID
- Real-time timer
- Detailed result breakdown
- Question navigation

## Security Features 🔒
- Prevent copy-paste
- Disable right-click
- Tab switch detection
- Developer tools blocking
- Limited tab switching attempts

## Technologies Used 💻
- HTML5
- CSS3
- JavaScript
- Supabase (Backend & Database)
- Tailwind CSS (Optional styling)

## Prerequisites 📋
- Modern web browser
- Supabase account
- Internet connection

## Installation Steps 🛠️

### 1. Clone the Repository
```bash
https://github.com/rishik-ashili/QuizWebsite
cd QuizWebsite
```

### 2. Supabase Setup
1. Create a new Supabase project
2. Create two tables:
   - `quizzes`
   - `attempts`

#### Quizzes Table Schema
| Column Name     | Type    | Details                |
|----------------|----------|------------------------|
| quiz_id        | text     | Primary Key            |
| questions      | jsonb    | Quiz questions         |
| time_limit     | integer  | Quiz duration (seconds)|
| owner_username | text     | Quiz creator username  |
| owner_password | text     | Encoded password       |
| created_at     | timestamp| Quiz creation time     |

#### Attempts Table Schema
| Column Name      | Type      | Details                |
|-----------------|------------|------------------------|
| quiz_id         | text       | Foreign Key to quizzes |
| participant_name| text       | Participant name       |
| score           | integer    | Quiz score             |
| attempted_at    | timestamp  | Attempt timestamp      |

### 3. Configuration
1. Replace Supabase URL and Key in `script.js`
2. Ensure all HTML, CSS, and JS files are in the same directory

## How to Use 🖥️

### Creating a Quiz
1. Click "Create Quiz"
2. Enter Quiz ID, Time Limit
3. Upload CSV with questions
4. Provide username and password

### CSV Format for Quiz Upload
```
Question,Option A,Option B,Option C,Option D,Correct Answer
What is JavaScript?,A Script,A Language,A Markup,A Style,B
```

### Attempting a Quiz
1. Click "Attempt Quiz"
2. Enter Quiz ID
3. Provide Participant Name
4. Start Quiz

## Security Considerations ⚠️
- Base64 password encoding is NOT secure for production
- Implement proper password hashing in production
- Use HTTPS
- Add additional authentication layers

## Browser Compatibility 🌐
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Future Improvements 🚧
- User registration system
- More detailed analytics
- Advanced question types
- Randomized question order
- Leaderboard functionality

## Troubleshooting 🛠
- Ensure Supabase credentials are correct
- Check browser console for any errors
- Verify CSV format
- Confirm internet connectivity

## Contributing 🤝
1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License 📄
This project is open-source, licensed under the MIT License.

## Contact 📧
For questions or support, please open an issue on GitHub or contact [Your Email/Username]

---

**Happy Quizzing!** 🎉📊
