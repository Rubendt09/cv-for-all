/**
 * Curated keyword database for the Job Matcher feature.
 *
 * Organized by category. Each entry is the canonical display name.
 * Aliases (lowercase/abbreviation variants) are derived at runtime
 * by `normalizeKeyword` in jobMatcher.ts, so we only list canonical
 * forms here to keep the database compact and maintainable.
 */

export type KeywordCategory =
  | "language"
  | "framework"
  | "database"
  | "infrastructure"
  | "tool"
  | "methodology"
  | "soft-skill";

interface KeywordEntry {
  /** Canonical display name. */
  name: string;
  /** Additional aliases that should match this keyword. */
  aliases?: string[];
}

interface KeywordCategoryDefinition {
  category: KeywordCategory;
  keywords: KeywordEntry[];
}

export const KEYWORD_DATABASE: KeywordCategoryDefinition[] = [
  {
    category: "language",
    keywords: [
      { name: "Python", aliases: ["py"] },
      { name: "JavaScript", aliases: ["js", "vanilla js"] },
      { name: "TypeScript", aliases: ["ts"] },
      { name: "Go", aliases: ["golang"] },
      { name: "Rust", aliases: ["rs"] },
      { name: "Java" },
      { name: "Kotlin" },
      { name: "Scala" },
      { name: "C", aliases: ["c lang"] },
      { name: "C++", aliases: ["cpp", "c plus plus"] },
      { name: "C#", aliases: ["csharp", "c sharp", ".net"] },
      { name: "Ruby", aliases: ["rb"] },
      { name: "PHP" },
      { name: "Swift" },
      { name: "Objective-C", aliases: ["objective c", "obj-c"] },
      { name: "Dart" },
      { name: "Elixir" },
      { name: "Haskell" },
      { name: "Clojure" },
      { name: "Lua" },
      { name: "Perl" },
      { name: "R" },
      { name: "MATLAB" },
      { name: "Shell", aliases: ["bash", "zsh", "sh"] },
      { name: "SQL", aliases: ["structured query language"] },
      { name: "HTML", aliases: ["html5"] },
      { name: "CSS", aliases: ["css3"] },
      { name: "Sass", aliases: ["scss"] },
      { name: "Bash" },
    ],
  },
  {
    category: "framework",
    keywords: [
      { name: "React", aliases: ["reactjs", "react.js"] },
      { name: "Vue", aliases: ["vuejs", "vue.js", "vue 2", "vue 3"] },
      { name: "Angular", aliases: ["angularjs", "angular.js"] },
      { name: "Svelte", aliases: ["sveltekit"] },
      { name: "Next.js", aliases: ["nextjs", "next js"] },
      { name: "Nuxt", aliases: ["nuxtjs"] },
      { name: "Remix" },
      { name: "Gatsby" },
      { name: "Node.js", aliases: ["node", "nodejs"] },
      { name: "Express", aliases: ["express.js", "expressjs"] },
      { name: "NestJS", aliases: ["nest.js"] },
      { name: "Fastify" },
      { name: "Koa" },
      { name: "Django" },
      { name: "Flask" },
      { name: "FastAPI", aliases: ["fast api"] },
      { name: "Pyramid" },
      { name: "Spring", aliases: ["spring boot", "spring framework"] },
      { name: "Spring Boot", aliases: ["springboot"] },
      { name: "Rails", aliases: ["ruby on rails", "ror"] },
      { name: "Sinatra" },
      { name: "Laravel" },
      { name: "Symfony" },
      { name: "CodeIgniter" },
      { name: ".NET Core", aliases: ["dotnet core", ".net 5", ".net 6", ".net 7", ".net 8"] },
      { name: "ASP.NET", aliases: ["asp net", "aspnet"] },
      { name: "Flutter" },
      { name: "React Native", aliases: ["react-native"] },
      { name: "Ionic" },
      { name: "Xamarin" },
      { name: "Qt" },
      { name: "GTK" },
      { name: "Tailwind CSS", aliases: ["tailwindcss", "tailwind"] },
      { name: "Bootstrap" },
      { name: "Material UI", aliases: ["mui", "material-ui"] },
      { name: "Chakra UI", aliases: ["chakraui"] },
      { name: "Ember", aliases: ["ember.js", "emberjs"] },
      { name: "Backbone", aliases: ["backbone.js", "backbonejs"] },
      { name: "jQuery" },
      { name: "Astro" },
      { name: "Solid", aliases: ["solidjs", "solid.js"] },
      { name: "Hugo" },
      { name: "Jekyll" },
      { name: "Eleventy" },
      { name: "Gin" },
      { name: "Echo" },
      { name: "Actix", aliases: ["actix-web"] },
      { name: "Rocket" },
      { name: "Tokio" },
      { name: "Axum" },
      { name: "Phoenix", aliases: ["phoenix framework", "phoenix liveview"] },
      { name: "Actix Web" },
    ],
  },
  {
    category: "database",
    keywords: [
      { name: "PostgreSQL", aliases: ["postgres", "pg"] },
      { name: "MySQL", aliases: ["my sql"] },
      { name: "MariaDB" },
      { name: "SQLite" },
      { name: "MongoDB", aliases: ["mongo"] },
      { name: "Redis" },
      { name: "Elasticsearch", aliases: ["elastic search", "elastic"] },
      { name: "DynamoDB", aliases: ["dynamo db"] },
      { name: "Cassandra" },
      { name: "CouchDB", aliases: ["couch db"] },
      { name: "Neo4j" },
      { name: "InfluxDB" },
      { name: "Firebase", aliases: ["firestore"] },
      { name: "Supabase" },
      { name: "Prisma" },
      { name: "GraphQL" },
      { name: "Drizzle" },
      { name: "SQLAlchemy", aliases: ["sql alchemy"] },
      { name: "TypeORM" },
      { name: "Sequelize" },
      { name: "Mongoose" },
      { name: "Deno" },
      { name: "Bun" },
    ],
  },
  {
    category: "infrastructure",
    keywords: [
      { name: "Docker" },
      { name: "Kubernetes", aliases: ["k8s"] },
      { name: "Docker Compose", aliases: ["docker-compose"] },
      { name: "AWS", aliases: ["amazon web services"] },
      { name: "GCP", aliases: ["google cloud", "google cloud platform"] },
      { name: "Azure", aliases: ["microsoft azure"] },
      { name: "Terraform" },
      { name: "Ansible" },
      { name: "Puppet" },
      { name: "Chef" },
      { name: "Vagrant" },
      { name: "Helm" },
      { name: "Istio" },
      { name: "Consul" },
      { name: "Vault" },
      { name: "Nginx" },
      { name: "Apache", aliases: ["apache httpd", "httpd"] },
      { name: "HAProxy" },
      { name: "Traefik" },
      { name: "Caddy" },
      { name: "Serverless", aliases: ["serverless framework"] },
      { name: "Lambda", aliases: ["aws lambda"] },
      { name: "EC2" },
      { name: "S3" },
      { name: "RDS" },
      { name: "CloudFormation" },
      { name: "CloudFront" },
      { name: "Cloudflare" },
      { name: "Vercel" },
      { name: "Netlify" },
      { name: "Heroku" },
      { name: "DigitalOcean", aliases: ["digital ocean"] },
      { name: "Linode" },
      { name: "Fly.io", aliases: ["fly io"] },
      { name: "Railway" },
      { name: "Render" },
      { name: "OpenStack" },
      { name: "Microservices", aliases: ["microservice"] },
      { name: "Kafka" },
      { name: "RabbitMQ", aliases: ["rabbit mq"] },
      { name: "Celery" },
      { name: "Sidekiq" },
      { name: "Bull", aliases: ["bullmq"] },
      { name: "gRPC" },
      { name: "REST API", aliases: ["rest apis", "rest", "restful"] },
      { name: "SOAP" },
      { name: "WebSockets", aliases: ["websocket", "ws"] },
      { name: "OAuth", aliases: ["oauth2", "oauth 2.0"] },
      { name: "JWT", aliases: ["json web token"] },
      { name: "SAML" },
      { name: "OpenID", aliases: ["openid connect", "oidc"] },
    ],
  },
  {
    category: "tool",
    keywords: [
      { name: "Git" },
      { name: "GitHub" },
      { name: "GitLab" },
      { name: "Bitbucket" },
      { name: "Jenkins" },
      { name: "GitHub Actions", aliases: ["gh actions"] },
      { name: "CircleCI", aliases: ["circle ci"] },
      { name: "Travis CI", aliases: ["travis"] },
      { name: "GitLab CI", aliases: ["gitlab-ci"] },
      { name: "Bamboo" },
      { name: "TeamCity" },
      { name: "ArgoCD", aliases: ["argo cd", "argo"] },
      { name: "Jira" },
      { name: "Confluence" },
      { name: "Trello" },
      { name: "Asana" },
      { name: "Notion" },
      { name: "Slack" },
      { name: "Figma" },
      { name: "Sketch" },
      { name: "Adobe XD", aliases: ["xd"] },
      { name: "Photoshop" },
      { name: "Illustrator" },
      { name: "Webpack" },
      { name: "Vite" },
      { name: "Rollup" },
      { name: "esbuild" },
      { name: "Babel" },
      { name: "ESLint" },
      { name: "Prettier" },
      { name: "Jest" },
      { name: "Vitest" },
      { name: "Mocha" },
      { name: "Chai" },
      { name: "Cypress" },
      { name: "Playwright" },
      { name: "Selenium" },
      { name: "Puppeteer" },
      { name: "Testing Library" },
      { name: "Storybook" },
      { name: "Postman" },
      { name: "Insomnia" },
      { name: "Swagger", aliases: ["openapi"] },
      { name: "Grafana" },
      { name: "Prometheus" },
      { name: "Datadog" },
      { name: "Sentry" },
      { name: "New Relic", aliases: ["newrelic"] },
      { name: "Splunk" },
      { name: "ELK", aliases: ["elk stack"] },
      { name: "Kibana" },
      { name: "Logstash" },
      { name: "Linux" },
      { name: "Unix" },
      { name: "macOS" },
      { name: "Windows" },
      { name: "VS Code", aliases: ["vscode", "visual studio code"] },
      { name: "IntelliJ" },
      { name: "Eclipse" },
      { name: "Vim", aliases: ["vi"] },
      { name: "Emacs" },
      { name: "Make" },
      { name: "CMake" },
      { name: "Gradle" },
      { name: "Maven" },
      { name: "npm" },
      { name: "yarn" },
      { name: "pnpm" },
      { name: "pip" },
      { name: "poetry" },
      { name: "cargo" },
      { name: "composer" },
      { name: "bundle", aliases: ["bundler"] },
      { name: "Homebrew", aliases: ["brew"] },
      { name: "Chocolatey" },
      { name: "Scoop" },
    ],
  },
  {
    category: "methodology",
    keywords: [
      { name: "Agile" },
      { name: "Scrum" },
      { name: "Kanban" },
      { name: "Waterfall" },
      { name: "CI/CD", aliases: ["cicd", "continuous integration", "continuous deployment", "continuous delivery"] },
      { name: "TDD", aliases: ["test driven development", "test-driven development"] },
      { name: "BDD", aliases: ["behavior driven development", "behavior-driven development"] },
      { name: "DDD", aliases: ["domain driven design", "domain-driven design"] },
      { name: "DevOps" },
      { name: "DevSecOps" },
      { name: "SRE", aliases: ["site reliability engineering"] },
      { name: "Microservices", aliases: ["microservice architecture"] },
      { name: "Monolith", aliases: ["monolithic"] },
      { name: "Serverless" },
      { name: "Event-Driven", aliases: ["event driven", "event-driven architecture"] },
      { name: "Object-Oriented", aliases: ["oop", "object oriented", "object-oriented programming"] },
      { name: "Functional Programming", aliases: ["fp", "functional"] },
      { name: "Design Patterns" },
      { name: "SOLID" },
      { name: "Clean Code" },
      { name: "Code Review", aliases: ["code reviews"] },
      { name: "Pair Programming", aliases: ["pairing", "pair programing"] },
      { name: "Unit Testing", aliases: ["unit tests", "unit test"] },
      { name: "Integration Testing", aliases: ["integration tests"] },
      { name: "End-to-End Testing", aliases: ["e2e testing", "e2e tests", "end to end testing"] },
      { name: "Performance Testing" },
      { name: "Load Testing" },
      { name: "Accessibility", aliases: ["a11y", "wcag"] },
      { name: "Responsive Design" },
      { name: "Mobile-First" },
      { name: "Progressive Enhancement" },
      { name: "SEO" },
      { name: "Web Performance", aliases: ["web vitals", "core web vitals"] },
      { name: "Security", aliases: ["infosec", "application security"] },
      { name: "OWASP" },
      { name: "PCI Compliance", aliases: ["pci dss"] },
      { name: "HIPAA" },
      { name: "GDPR" },
      { name: "SOC 2", aliases: ["soc2"] },
      { name: "MVC" },
      { name: "MVVM" },
      { name: "Flux" },
      { name: "Redux" },
      { name: "Zustand" },
      { name: "RxJS" },
      { name: "GraphQL" },
      { name: "REST" },
      { name: "Documentation" },
      { name: "Technical Writing" },
      { name: "Mentoring", aliases: ["mentorship"] },
      { name: "Leadership" },
      { name: "Stakeholder Management" },
      { name: "Cross-functional", aliases: ["cross functional"] },
      { name: "Product Management" },
      { name: "Project Management", aliases: ["pm"] },
      { name: "Roadmap" },
      { name: "Specification", aliases: ["specs"] },
      { name: "Architecture" },
      { name: "System Design" },
      { name: "Data Structures" },
      { name: "Algorithms" },
      { name: "Distributed Systems" },
      { name: "Concurrency" },
      { name: "Multithreading" },
      { name: "Async/Await", aliases: ["async", "asynchronous"] },
      { name: "Streaming" },
      { name: "Batch Processing" },
      { name: "ETL" },
      { name: "Data Pipeline", aliases: ["data pipelines"] },
      { name: "Machine Learning", aliases: ["ml"] },
      { name: "Deep Learning" },
      { name: "NLP", aliases: ["natural language processing"] },
      { name: "Computer Vision" },
      { name: "TensorFlow" },
      { name: "PyTorch" },
      { name: "scikit-learn", aliases: ["sklearn"] },
      { name: "Pandas" },
      { name: "NumPy", aliases: ["numpy"] },
      { name: "Jupyter" },
      { name: "Data Analysis" },
      { name: "Data Visualization" },
      { name: "Statistics" },
      { name: "A/B Testing", aliases: ["ab testing", "a-b testing"] },
      { name: "Analytics" },
      { name: "Big Data" },
      { name: "Hadoop" },
      { name: "Spark" },
      { name: "Flink" },
      { name: "Snowflake" },
      { name: "Databricks" },
      { name: "Airflow" },
      { name: "dbt" },
      { name: "Tableau" },
      { name: "Power BI", aliases: ["powerbi"] },
      { name: "Looker" },
    ],
  },
  {
    category: "soft-skill",
    keywords: [
      { name: "Communication" },
      { name: "Collaboration" },
      { name: "Teamwork", aliases: ["team work"] },
      { name: "Problem Solving", aliases: ["problem-solving"] },
      { name: "Critical Thinking" },
      { name: "Creativity" },
      { name: "Adaptability" },
      { name: "Time Management" },
      { name: "Attention to Detail", aliases: ["attention to details"] },
      { name: "Self-Motivated", aliases: ["self motivated", "self-starter"] },
      { name: "Self-Starter" },
      { name: "Initiative" },
      { name: "Ownership" },
      { name: "Accountability" },
      { name: "Reliability" },
      { name: "Flexibility" },
      { name: "Patience" },
      { name: "Empathy" },
      { name: "Conflict Resolution" },
      { name: "Negotiation" },
      { name: "Presentation", aliases: ["presentations"] },
      { name: "Public Speaking" },
      { name: "Writing" },
      { name: "Interpersonal" },
      { name: "Customer Service", aliases: ["client service"] },
      { name: "Customer Focus", aliases: ["customer-centric"] },
      { name: "User Experience", aliases: ["ux"] },
      { name: "User Interface", aliases: ["ui"] },
      { name: "Product Sense" },
      { name: "Strategic Thinking" },
      { name: "Decision Making", aliases: ["decision-making"] },
      { name: "Prioritization" },
      { name: "Planning" },
      { name: "Organization", aliases: ["organizational"] },
      { name: "Multitasking" },
      { name: "Continuous Learning" },
      { name: "Growth Mindset" },
      { name: "Feedback" },
      { name: "Coaching" },
      { name: "Delegation" },
      { name: "Hiring", aliases: ["recruiting", "interviewing"] },
      { name: "Onboarding" },
      { name: "Training" },
      { name: "Workshop", aliases: ["workshops"] },
      { name: "Facilitation" },
    ],
  },
];

/**
 * Build a lookup map: normalized alias -> { name, category }.
 * Normalized form is lowercase, trimmed, with non-alphanumeric
 * sequences collapsed to single spaces.
 */
export interface KeywordLookupEntry {
  name: string;
  category: KeywordCategory;
}

export function normalizeKeyword(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const KEYWORD_LOOKUP: Map<string, KeywordLookupEntry> = (() => {
  const map = new Map<string, KeywordLookupEntry>();
  for (const group of KEYWORD_DATABASE) {
    for (const kw of group.keywords) {
      const canonical = normalizeKeyword(kw.name);
      map.set(canonical, { name: kw.name, category: group.category });
      if (kw.aliases) {
        for (const alias of kw.aliases) {
          const normalizedAlias = normalizeKeyword(alias);
          if (normalizedAlias && !map.has(normalizedAlias)) {
            map.set(normalizedAlias, { name: kw.name, category: group.category });
          }
        }
      }
    }
  }
  return map;
})();

export function lookupKeyword(
  normalized: string,
): KeywordLookupEntry | undefined {
  return KEYWORD_LOOKUP.get(normalized);
}

/**
 * Return all canonical keyword names for a given category.
 */
export function keywordsByCategory(category: KeywordCategory): string[] {
  const group = KEYWORD_DATABASE.find((g) => g.category === category);
  return group ? group.keywords.map((k) => k.name) : [];
}

export const ALL_CATEGORIES: KeywordCategory[] = KEYWORD_DATABASE.map(
  (g) => g.category,
);
