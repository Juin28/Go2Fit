# Project: Go2Fit

## Short Description
Go2Fit is a fitness-focused mobile application designed to help users track their fitness activities, manage their profiles, and access detailed reports. The app is built using React Native and leverages `mobx-react-lite` for state management and `expo-router` for navigation.

## What We Have Done
- Implemented a tab navigation system for seamless navigation between screens.
- Integrated `mobx-react-lite` for reactive state management across the app.
- Finished the basic UI and functions for `Home`, `Training`, `Exercises`, `Report` and `Profile` tabs.
- Save training sessions data to Firebase for persistence.
- Completed the integration between the `Training` and `Exercises` tabs.
- Set up the user authentication using Firebase Authentication.
- Fetching all the exercises from the API and showed the progress.
- Finished the `Training` and `Exercises` tabs.

## What We Still Plan to Do
- Implement the `Report` tab with the actual training data for each user.
- Implement the delete function for training session at `Home`.
- Implement the search function at the `Home` tab so that the user can filter or search different training sessions.

## Project File Structure
### `/src/app`
- **_layout.jsx**: The basic layout of our app to display different tabs.
- **index.jsx**: The component to display all the training sessions the user has created.
- **training.jsx**: The component to display the details of the selected training session.
- **exercises.jsx**: The component to display all the exercises we fetched from the API.
- **report.jsx**: The component to display the user's workout history.
- **profile.jsx**: The component for user's authentication and update user's information.

### `/src/presenters`
- **homePresenter.jsx**: The presenter for the `Home` tab, which handles the business logics and passes the props down to the view.
- **trainingPresenter.jsx**: The presenter for the `Training` tab, which handles the business logics and passes the props down to the view.
- **exercisesPresenter.jsx**: The presenter for the `Exercises` tab, which handles the business logics and passes the props down to the view.
- **reportPresenter.jsx**: The presenter for the `Report` tab, which handles the business logics and passes the props down to the view.
- **profilePresenter.jsx**: The presenter for the `Profile` tab, which handles the business logics and passes the props down to the view.

### `/src/views`
- **homeView.jsx**: The view for the `Home` tab, which receives the prop from the presenter and displays the UI.
- **trainingView.jsx**: The view for the `Training` tab, which receives the prop from the presenter and displays the UI.
- **exercisesView.jsx**: The view for the `Exercises` tab, which receives the prop from the presenter and displays the UI.
- **reportView.jsx**: The view for the `Report` tab, which receives the prop from the presenter and displays the UI.
- **profileView.jsx**: The view for the `Profile` tab, which receives the prop from the presenter and displays the UI.

### `/src/bootstrapping.js`
- The MobX state model used across the app for managing reactive data.

### `/src/trainingSessionUtilities.js`
- The helper functions to access the Firebase database

### `/src/apiParams.js`
- The possible parameters while fetching the API

### `/src/resolvePromise.js`
- The helper function to resolve the promises

### `/Flow.jpeg`
- The basic flow of our app





