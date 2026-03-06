// Importing necessary modules
const fs = require('fs');

const executors = [
    {
        name: 'ExecutorOne',
        description: 'This is the first executor description',
        pros: ['Fast', 'Efficient'],
        cons: ['None'],
        notes: 'Some important notes.',
        tips: 'Useful tips.',
        officialSite: ['https://officialsiteone.com']
    },
    {
        name: 'ExecutorTwo',
        description: 'This is the second executor description.',
        pros: ['Reliable', 'Easy to use'],
        cons: ['Limited features.'],
        notes: 'Some other notes.',
        tips: 'More useful tips.',
        officialSite: ['https://officialsitetwo.com']
    }
];

// Function that handles the per-executor processing
executors.forEach(executor => {
    // Removing trailing periods from description, pros, cons, notes and tips
    executor.description = executor.description.replace(/\.$/, '');
    executor.pros = executor.pros.map(p => p.replace(/\.$/, ''));
    executor.cons = executor.cons.map(c => c.replace(/\.$/, ''));
    executor.notes = executor.notes.replace(/\.$/, '');
    executor.tips = executor.tips.replace(/\.$/, '');
});

// Writing the updated executors to script.js file
fs.writeFileSync('script.js', JSON.stringify(executors, null, 2));