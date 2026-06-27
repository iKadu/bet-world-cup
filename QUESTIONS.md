# Interview Answers - JS / TS / React

## Question 1: JavaScript Fundamentals & ES6+
**Explain the difference between `let`, `const`, and `var`.**

So the main difference comes down to scope and whether you can reassign the value or not.

`var` is the old-school way, and the problem with it is that it's function-scoped, not block-scoped. So if you declare a `var` inside an `if`, it "leaks" out and is still accessible outside of it, which causes a lot of confusing bugs.

```javascript
if (true) {
  var x = 10;
}
console.log(x); // 10, even outside the if block
```

`let` fixed that. It's block-scoped, meaning it only exists inside the `{}` where it was declared. And you can reassign its value later.

```javascript
if (true) {
  let y = 10;
}
console.log(y); // error, y doesn't exist out here
```

`const` works the same as `let` in terms of scope (block-scoped), but you can't reassign the value once you've declared it. One important thing to note: that doesn't mean the content is immutable. If it's an object or array, you can still change its properties — you just can't swap out the whole reference.

```javascript
const obj = { name: "John" };
obj.name = "Mary"; // this works fine
obj = {}; // this throws an error
```

In practice, I use `const` most of the time, and only switch to `let` when I know I'll need to reassign the value at some point (like a loop counter). I don't really use `var` anymore, except when reading older code.

---

## Question 2: Async JavaScript & API Integration
**Fetch user data and then their posts, using Promises and async/await. How would you handle errors in both cases?**

This is a classic case of a chained request, where one call depends on the result of the previous one.

### With Promises (.then)

```javascript
function getUserAndPosts(userId) {
  return fetch(`https://api.example.com/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      return fetch(`https://api.example.com/posts?userId=${user.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
          }
          return response.json();
        })
        .then(posts => ({ user, posts }));
    })
    .catch(error => {
      console.error("Request failed:", error.message);
      throw error;
    });
}
```

### With async/await

```javascript
async function getUserAndPosts(userId) {
  try {
    const userResponse = await fetch(`https://api.example.com/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user: ${userResponse.status}`);
    }
    const user = await userResponse.json();

    const postsResponse = await fetch(`https://api.example.com/posts?userId=${user.id}`);
    if (!postsResponse.ok) {
      throw new Error(`Failed to fetch posts: ${postsResponse.status}`);
    }
    const posts = await postsResponse.json();

    return { user, posts };
  } catch (error) {
    console.error("Request failed:", error.message);
    throw error;
  }
}
```

### On error handling

With Promises, you handle everything with `.catch()` at the end of the chain. It works fine, but once the logic grows a bit and you've got several nested `.then()` calls, it gets harder to read — it kind of turns into that same "callback hell" feeling, just with Promises instead of callbacks.

With async/await, you use `try/catch`, which is the same pattern we've used in synchronous code for years. To me it's a lot more readable, especially in cases like this one where you've got one call depending on another.

These days I use async/await for the vast majority of cases. I only reach for "pure" Promises when I need to run things in parallel, like with `Promise.all()`.

---

## Question 3: TypeScript Fundamentals
**Define an interface for a blog post with required and optional fields, then a function that returns a formatted summary.**

```typescript
interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  tags?: string[];
  publishedAt?: Date;
}
```

And the function that takes this type and returns a formatted summary:

```typescript
function formatPostSummary(post: BlogPost): string {
  const tagsText = post.tags && post.tags.length > 0
    ? ` [${post.tags.join(", ")}]`
    : "";

  const dateText = post.publishedAt
    ? ` — published on ${post.publishedAt.toLocaleDateString("en-US")}`
    : " — draft (not published)";

  const preview = post.content.length > 100
    ? post.content.slice(0, 100) + "..."
    : post.content;

  return `${post.title} by ${post.author}${dateText}${tagsText}\n${preview}`;
}
```

Example usage:

```typescript
const post: BlogPost = {
  id: "1",
  title: "Learning TypeScript",
  content: "TypeScript is a superset of JavaScript that adds static typing...",
  author: "Ana Silva",
  tags: ["typescript", "javascript"],
  publishedAt: new Date()
};

console.log(formatPostSummary(post));
```

One thing I'm always careful about: optional fields like `tags` and `publishedAt` end up typed as `T | undefined`. So before I use them, I always check if they exist first (that's why I did `post.tags &&` and `post.publishedAt ?`), otherwise you'll get a runtime error if you try to call `.join()` or something similar on `undefined`.

---

## Question 4: React/Frontend Framework Concepts
**State, props, and how a child component notifies the parent when a button is clicked.**

Props are what a component receives from outside, from the parent component. They're read-only — the child can't change its own props directly.

State is what the component manages internally, and when that value changes, the component re-renders.

To put it simply: props are "what I was given," state is "what I control and can change."

As for the child notifying the parent: in React, data flows top-down (through props), and events flow bottom-up through callback functions. So the parent creates a function and passes it down to the child as a prop. When the child wants to notify that something happened, it just calls that function it received.

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  function handleChildButtonClick() {
    setCount(prev => prev + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <Child onButtonClick={handleChildButtonClick} />
    </div>
  );
}

function Child({ onButtonClick }) {
  return (
    <button onClick={onButtonClick}>
      Click here
    </button>
  );
}
```

The `Child` component doesn't know and doesn't need to know what happens when the button is clicked — it just fires the function it received. The `Parent` is the one who decides what to do with that (in this case, updating the state). This is a pretty common pattern in React, called "lifting state up."

---

## Question 5: DOM Manipulation & Event Handling
**Validate required form fields before submission and show errors next to each field.**

```html
<form id="myForm">
  <div class="field">
    <label for="name">Name*</label>
    <input type="text" id="name" name="name" required>
    <span class="error" id="error-name"></span>
  </div>

  <div class="field">
    <label for="email">Email*</label>
    <input type="email" id="email" name="email" required>
    <span class="error" id="error-email"></span>
  </div>

  <div class="field">
    <label for="phone">Phone</label>
    <input type="text" id="phone" name="phone">
    <span class="error" id="error-phone"></span>
  </div>

  <button type="submit">Submit</button>
</form>
```

```javascript
const form = document.getElementById('myForm');

form.addEventListener('submit', function (event) {
  event.preventDefault(); // stops the page from reloading before I validate

  clearErrors();

  const requiredFields = form.querySelectorAll('[required]');
  let isFormValid = true;

  requiredFields.forEach(field => {
    const value = field.value.trim();

    if (value === '') {
      showError(field, 'This field is required');
      isFormValid = false;
    } else if (field.type === 'email' && !isValidEmail(value)) {
      showError(field, 'Please enter a valid email');
      isFormValid = false;
    }
  });

  if (isFormValid) {
    console.log('Form is valid, submitting...');
    // form.submit(); or a fetch call to send it to the API
  }
});

function showError(field, message) {
  const errorEl = document.getElementById(`error-${field.id}`);
  if (errorEl) {
    errorEl.textContent = message;
  }
  field.classList.add('field-invalid');
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
  document.querySelectorAll('input').forEach(el => el.classList.remove('field-invalid'));
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

A few things I always make a point of mentioning for this kind of question:

- `event.preventDefault()` is essential — without it, the form reloads the page before I even get a chance to validate anything.
- I always clear old errors before validating again, otherwise you end up with "ghost" error messages from previous attempts that have already been fixed.
- And the most important part: this front-end validation is purely for user experience. The validation that actually matters for security always has to live on the backend too, because client-side JS can be bypassed pretty easily.