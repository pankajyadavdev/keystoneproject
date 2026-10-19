# KEYSTONE · Society Operations

KEYSTONE is a field service and facilities workspace for residential societies. It includes a React dashboard, a Spring Boot API, JWT login, work order management, and PostgreSQL storage.

## Run the complete app locally with Docker

Install and start Docker Desktop. From PowerShell, open the project folder (the one containing `compose.yaml`) and run:

```powershell
docker compose up --build -d
docker compose ps
```

The first run downloads the build images and dependencies. Wait until `postgres` is healthy and the other services are running, then open <http://localhost:5173>.

To connect the dashboard to the API, click the manager profile at the bottom of the sidebar and choose **Connect API**. The local demo credentials are:

- Email: `manager@maplegrove.in`
- Password: `maple-grove-2026`

See startup output with `docker compose logs -f backend`. Stop the app with `docker compose down`; this keeps the PostgreSQL data volume.

The app is also available without Docker for frontend work: run `npm install` once, then `npm run dev` and open <http://localhost:5173>.

## Run backend and frontend separately on Windows

Use this mode when you want Spring Boot and Vite to run directly on Windows. First start only the database:

```powershell
docker compose up -d postgres
```

In one PowerShell window, from the project root, start the API:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-22'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:DATABASE_URL = 'jdbc:postgresql://127.0.0.1:5433/keystone'
$env:DATABASE_USERNAME = 'keystone'
$env:DATABASE_PASSWORD = 'keystone'
.\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

If your JDK is in another folder, set `JAVA_HOME` to that folder. This project includes the Windows Maven Wrapper, so a separate Maven installation is optional. The first wrapper run downloads Maven. You can also use your installed Maven with `mvn -f .\backend\pom.xml spring-boot:run`.

In another PowerShell window, from the project root, start Vite:

```powershell
npm install
npm run dev
```

Open <http://localhost:5173>. If the full Docker app is already running, stop its frontend and backend containers first to free the development ports:

```powershell
docker compose stop frontend backend
```

The PostgreSQL container stays running on port `5433` for the Windows API.

## Deploy from GitHub

You do not need to install Docker or Maven on your computer for this deployment. Render builds the project from GitHub using the included Dockerfiles. The [render.yaml](render.yaml) file tells Render to create the frontend, API, and PostgreSQL database together using a Blueprint. See [Render Blueprints](https://render.com/docs/infrastructure-as-code) and the [Blueprint YAML reference](https://render.com/docs/blueprint-spec).

1. Push the latest project files, including `render.yaml`, to your GitHub repository.
2. Create a Render account, open the dashboard, and select **New → Blueprint**.
3. Connect your GitHub account and select the KEYSTONE repository.
4. Render reads `render.yaml`. Enter a private value for `KEYSTONE_DEMO_PASSWORD` when prompted, then choose **Apply**.
5. Wait for the services to finish deploying. Open the `keystone-frontend` URL shown in Render.
6. In KEYSTONE, open the manager profile and choose **Connect API**. Sign in with `manager@maplegrove.in` and the demo password you entered.

Future pushes to the connected GitHub branch trigger a new deployment automatically. Render handles the build and server; you do not need to run Docker commands yourself. The free Render PostgreSQL database expires after 30 days and is for demos only. Choose a paid persistent database before storing real society or resident data. [Render free instance limits](https://render.com/docs/free)

## Configuration

Copy `.env.example` to `.env` to change local or deployment values. Supported variables are:

| Variable | Local default | Purpose |
| --- | --- | --- |
| `WEB_PORT` | `5173` | Host port bound to `127.0.0.1` for the frontend |
| `DATABASE_PORT` | `5433` | PostgreSQL port on the local machine |
| `DATABASE_PASSWORD` | `keystone` | PostgreSQL account password |
| `KEYSTONE_DEMO_USERNAME` | `manager@maplegrove.in` | Local demo login |
| `KEYSTONE_DEMO_PASSWORD` | `maple-grove-2026` | Local demo password |
| `KEYSTONE_JWT_SECRET` | Development-only value | JWT signing secret |

PostgreSQL keeps its data in a Docker volume. Changing `DATABASE_PASSWORD` after the volume has been initialized does not change the password inside that existing database; keep both values matched.

## Common issues

- **`mvnw.cmd` is not recognized:** run the command from the project root and check that `mvnw.cmd` is present. Otherwise use the installed `mvn` command.
- **Maven cannot find Java:** set `JAVA_HOME` to the JDK folder and reopen PowerShell.
- **Database authentication fails:** make sure PostgreSQL is healthy with `docker compose ps` and that the database password matches the initialized volume.
- **Port 5173 is already in use:** stop the existing Vite or Compose frontend before starting another one.
- **Port 8080 is already in use:** stop the existing Spring Boot process before starting another API.
- **Docker engine is unavailable:** open Docker Desktop and wait for it to finish starting, then rerun the Compose command.

## API routes

Work order routes require `Authorization: Bearer <token>`.

- `POST /api/auth/login` — sign in and receive a JWT
- `GET /api/work-orders` — list work orders
- `POST /api/work-orders` — create a work order
- `PATCH /api/work-orders/{id}/status` — change work order status
- `PATCH /api/work-orders/{id}/assignment` — assign or reassign a technician
