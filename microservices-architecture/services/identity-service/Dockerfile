# Multi-stage build pentru optimizare
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
EXPOSE 5000

# Install dependencies pentru Alpine
RUN apk add --no-cache \
    icu-libs \
    libgcc \
    libstdc++ \
    && addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy project files
COPY ["IdentityService.csproj", "./"]
COPY ["Directory.Build.props", "./"]

# Restore dependencies
RUN dotnet restore "IdentityService.csproj"

# Copy source code
COPY . .

# Build application
RUN dotnet build "IdentityService.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "IdentityService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app

# Copy published application
COPY --from=publish /app/publish .

# Copy configuration files
COPY ["config/", "./config/"]

# Create directories pentru logs și temp
RUN mkdir -p /app/logs /app/temp && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80;https://+:443
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Entry point
ENTRYPOINT ["dotnet", "IdentityService.dll"]