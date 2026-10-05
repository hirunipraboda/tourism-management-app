# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true

# Stage 2: SDK image for restoring and building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies first to leverage Docker layer caching
COPY ["Nova.Api/Nova.Api.csproj", "Nova.Api/"]
RUN dotnet restore "Nova.Api/Nova.Api.csproj"

# Copy the rest of the backend source code
COPY . .
WORKDIR "/src/Nova.Api"

# Build in Release mode
RUN dotnet build "Nova.Api.csproj" -c Release -o /app/build

# Stage 3: Publish compiled release artifacts
FROM build AS publish
RUN dotnet publish "Nova.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final production image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Start the application using Render's dynamic PORT (defaults to 8080 if not set)
ENTRYPOINT ["sh", "-c", "ASPNETCORE_HTTP_PORTS=${PORT:-8080} exec dotnet Nova.Api.dll"]
