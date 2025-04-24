const express = require('express');
const app = express();
const port = 3000;

//form
app.use(express.urlencoded({ extended: true }));

const users = {
  adminHR: { role: 'Admin', department: 'HR', clearanceLevel: 3, yearsOfService: 5 },
  staffIT: { role: 'Staff', department: 'IT', clearanceLevel: 1, yearsOfService: 2 },
  managerFinance: { role: 'Manager', department: 'Finance', clearanceLevel: 2, yearsOfService: 7 },
  directorLegal: { role: 'Director', department: 'Legal', clearanceLevel: 3, yearsOfService: 10 },
  staffOps: { role: 'Staff', department: 'Operations', clearanceLevel: 1, yearsOfService: 1 },
  managerHR: { role: 'Manager', department: 'HR', clearanceLevel: 2, yearsOfService: 8 },
  staffFinance: { role: 'Staff', department: 'Finance', clearanceLevel: 1, yearsOfService: 3 }
};

function checkAccess(route, user) {
  const accessRules = {
    '/admin': {
      //only admins, regardless of department, clearance level, or years of service.
      requiredRole: 'Admin'
    },
    '/hr-department': {
      //users from the HR department, regardless of role, clearance level, or years of service.
      requiredDepartment: 'HR'
    },
    '/finance-manager': {
      //managers finance with at least 5 years of service.
      requiredRole: 'Manager',
      requiredDepartment: 'Finance',
      minYearsOfService: 5
    },
    '/it-clearance-2': {
      //users from IT with a clearance level of 2 or higher.
      requiredDepartment: 'IT',
      minClearanceLevel: 2
    },
    '/legal-director': {
      //directors legal with clearance level 3 (no years of service check).
      requiredRole: 'Director',
      requiredDepartment: 'Legal',
      requiredClearanceLevel: 3
    },
    '/ops-combined': {
      //staff operations with clearance level 1 and less than 3 years of service.
      requiredRole: 'Staff',
      requiredDepartment: 'Operations',
      minClearanceLevel: 1,
      maxYearsOfService: 3
    },
    '/exec-clearance-3': {
      //users with clearance level 3, role Manager or Director, and at least 7 years of service.
      requiredClearanceLevel: 3,
      requiredRoles: ['Manager', 'Director'],
      minYearsOfService: 7
    }
  };

  const routeRule = accessRules[route];

  if (!routeRule) {
    // If no rule is found for the route, deny access.
    return false;
  }

  // Check the required role
  if (routeRule.requiredRole && user.role !== routeRule.requiredRole) {
    return false;
  }

  // Check the required department
  if (routeRule.requiredDepartment && user.department !== routeRule.requiredDepartment) {
    return false;
  }

  // Check the minimum clearance level
  if (routeRule.minClearanceLevel && user.clearanceLevel < routeRule.minClearanceLevel) {
    return false;
  }

  // Check the required clearance level
  if (routeRule.requiredClearanceLevel && user.clearanceLevel !== routeRule.requiredClearanceLevel) {
    return false;
  }

  // Check the minimum years of service
  if (routeRule.minYearsOfService && user.yearsOfService < routeRule.minYearsOfService) {
    return false;
  }

  // Check the maximum years of service
  if (routeRule.maxYearsOfService && user.yearsOfService >= routeRule.maxYearsOfService) {
    return false;
  }

  //success
  return true;
}


//home
app.get('/', (req, res) => {
  res.send(`
    <form action="/select-role" method="post">
      <label for="role">Select Your Role:</label>
      <select name="role" id="role">
        <option value="adminHR">Admin HR</option>
        <option value="staffIT">Staff IT</option>
        <option value="managerFinance">Manager Finance</option>
        <option value="directorLegal">Director Legal</option>
        <option value="staffOps">Staff Operations</option>
        <option value="managerHR">Manager HR</option>
        <option value="staffFinance">Staff Finance</option>
      </select>
      <button type="submit">Select Role</button>
    </form>
  `);
});

//route to process the selected role and show available routes based on access control
app.post('/select-role', (req, res) => {
  const role = req.body.role;
  const user = users[role];

  if (!user) {
    return res.send('Invalid role selected!');
  }

  //all route based on selected role
  const availableRoutes = [];
  
  // Check access for each route
  if (checkAccess('/admin', user)) availableRoutes.push('/admin');
  if (checkAccess('/hr-department', user)) availableRoutes.push('/hr-department');
  if (checkAccess('/finance-manager', user)) availableRoutes.push('/finance-manager');
  if (checkAccess('/it-clearance-2', user)) availableRoutes.push('/it-clearance-2');
  if (checkAccess('/legal-director', user)) availableRoutes.push('/legal-director');
  if (checkAccess('/ops-combined', user)) availableRoutes.push('/ops-combined');
  if (checkAccess('/exec-clearance-3', user)) availableRoutes.push('/exec-clearance-3');

  //display routes and link to page
  let routesHtml = '';
  availableRoutes.forEach(route => {
    routesHtml += `<a href="${route}"><button type="button">${route}</button></a><br>`;
  });

  if (routesHtml === '') {
    routesHtml = 'You do not have access to any routes.';
  }

  res.send(`
    <h3>Available Routes for ${user.role}:</h3>
    ${routesHtml}
  `);
});

//all defined route
app.get('/admin', (req, res) => res.send('Admin-Only Page'));
app.get('/hr-department', (req, res) => res.send('HR Department Page'));
app.get('/finance-manager', (req, res) => res.send('Finance Manager Page'));
app.get('/it-clearance-2', (req, res) => res.send('IT Clearance 2 Page'));
app.get('/legal-director', (req, res) => res.send('Legal Director Page'));
app.get('/ops-combined', (req, res) => res.send('Operations Combined Page'));
app.get('/exec-clearance-3', (req, res) => res.send('Executive Clearance 3 Page'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
