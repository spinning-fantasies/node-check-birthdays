const fs = require('fs');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'mail.gandi.net',
  port: 25,
  secure: false, // Set to true if your SMTP server requires a secure connection
  auth: {
    user: '',
    pass: ''
  }
});

function loadBirthdays(filePath) {
  try {
    const csvString = fs.readFileSync(filePath, 'utf8');
    const lines = csvString.split('\n');
    const birthdays = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line !== '') {
            const [dateOfBirth, name] = line.split(',');
            const person = {
                name: name.trim(),
                dateOfBirth: new Date(dateOfBirth.trim())
            };
            birthdays.push(person);
        }
    }

    return birthdays;
  } catch (error) {
    console.error('Failed to read CSV file:', error);
    return [];
  }
}

function upcomingBirthdays(birthdays) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return birthdays.filter((person) => {
    const birthdayThisYear = new Date(person.dateOfBirth);

    birthdayThisYear.setFullYear(currentYear);

    const timeDifference = birthdayThisYear.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    return daysDifference >= -7 && daysDifference <= 31;
  });
}

function remind(birthdays) {
  const upcoming = upcomingBirthdays(birthdays);

  if (upcoming.length === 0) {
    console.log('No upcoming birthdays.');
    return;
  }

  const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });

  for (let i = 0; i < upcoming.length; i++) {
    const person = upcoming[i];
    const dateString = dateFormatter.format(person.dateOfBirth);

    // Calculate the age
    const today = new Date();
    person.age = today.getFullYear() - person.dateOfBirth.getFullYear();

    // Determine whether an age is singular or plural.
    function pluralize(age, word) {
      if (age === 1) {
        return `${age} ${word}`;
      } else {
        return `${age} ${word}s`;
      }
    }

    // Email date
    const mailOptions = {
      from: 'vieille-branche@spinning-fantasies.org',
      to: ['mate@e.email'],
      subject:  `L'anniversaire de ${person.name} est le ${dateString} ! (${person.dateOfBirth.getFullYear()}, ${pluralize(person.age, 'an')})`,
      text: `L'anniversaire de ${person.name} est le ${dateString} ! (${person.dateOfBirth.getFullYear()}, ${pluralize(person.age, 'an')})`,
    };

    // console.log(mailOptions)
    
    // Send the email
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
    // Send an SMS
    axios.get(`https://smsapi.free-mobile.fr/sendmsg/&msg=${mailOptions.text} `)
    .then(response => {
      console.log('Response:', response);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }



}

// Usage example
const filePath = 'data/dates.csv'; // Provide the correct path to the CSV file
const birthdays = loadBirthdays(filePath);
remind(birthdays);