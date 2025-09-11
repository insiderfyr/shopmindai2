package config

import (
	"log"

	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Keycloak KeycloakConfig `mapstructure:"keycloak"`
	JWT      JWTConfig      `mapstructure:"jwt"`
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Address string `mapstructure:"address"`
	Port    string `mapstructure:"port"`
	Mode    string `mapstructure:"mode"`
}

// KeycloakConfig holds Keycloak configuration
type KeycloakConfig struct {
	URL          string `mapstructure:"url"`
	Realm        string `mapstructure:"realm"`
	AdminRealm   string `mapstructure:"admin_realm"`
	ClientID     string `mapstructure:"client_id"`
	ClientSecret string `mapstructure:"client_secret"`
	AdminClientID string `mapstructure:"admin_client_id"`
	AdminUser    string `mapstructure:"admin_user"`
	AdminPass    string `mapstructure:"admin_pass"`
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	SecretKey string `mapstructure:"secret_key"`
	Issuer    string `mapstructure:"issuer"`
	Expiry    int    `mapstructure:"expiry"`
}

// LoadConfig loads configuration from environment variables and .env file
func LoadConfig() (*Config, error) {
	// Set config file
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Set default values
	setDefaults()

	// Read config file
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("No .env file found, using environment variables: %v", err)
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	// Override with environment variables if they exist
	if viper.GetString("SERVER_ADDRESS") != "" {
		config.Server.Address = viper.GetString("SERVER_ADDRESS")
	}
	if viper.GetString("KEYCLOAK_URL") != "" {
		config.Keycloak.URL = viper.GetString("KEYCLOAK_URL")
	}
	if viper.GetString("KEYCLOAK_REALM") != "" {
		config.Keycloak.Realm = viper.GetString("KEYCLOAK_REALM")
	}
	if viper.GetString("KEYCLOAK_ADMIN_REALM") != "" {
		config.Keycloak.AdminRealm = viper.GetString("KEYCLOAK_ADMIN_REALM")
	}
	if viper.GetString("KEYCLOAK_CLIENT_ID") != "" {
		config.Keycloak.ClientID = viper.GetString("KEYCLOAK_CLIENT_ID")
	}
	if viper.GetString("KEYCLOAK_CLIENT_SECRET") != "" {
		config.Keycloak.ClientSecret = viper.GetString("KEYCLOAK_CLIENT_SECRET")
	}
	if viper.GetString("KEYCLOAK_ADMIN_CLIENT_ID") != "" {
		config.Keycloak.AdminClientID = viper.GetString("KEYCLOAK_ADMIN_CLIENT_ID")
	}
	if viper.GetString("KEYCLOAK_ADMIN_USER") != "" {
		config.Keycloak.AdminUser = viper.GetString("KEYCLOAK_ADMIN_USER")
	}
	if viper.GetString("KEYCLOAK_ADMIN_PASS") != "" {
		config.Keycloak.AdminPass = viper.GetString("KEYCLOAK_ADMIN_PASS")
	}

	return &config, nil
}

// setDefaults sets default configuration values
func setDefaults() {
	// Server defaults
	viper.SetDefault("SERVER_ADDRESS", ":8080")
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_MODE", "debug")

	// Keycloak defaults
	viper.SetDefault("KEYCLOAK_URL", "http://localhost:8080")
	viper.SetDefault("KEYCLOAK_REALM", "master")
	viper.SetDefault("KEYCLOAK_ADMIN_REALM", "master")
	viper.SetDefault("KEYCLOAK_CLIENT_ID", "auth-service")
	viper.SetDefault("KEYCLOAK_CLIENT_SECRET", "your-client-secret")
	viper.SetDefault("KEYCLOAK_ADMIN_CLIENT_ID", "admin-cli")
	viper.SetDefault("KEYCLOAK_ADMIN_USER", "admin")
	viper.SetDefault("KEYCLOAK_ADMIN_PASS", "admin")

	// JWT defaults
	viper.SetDefault("JWT_SECRET_KEY", "your-secret-key")
	viper.SetDefault("JWT_ISSUER", "auth-service")
	viper.SetDefault("JWT_EXPIRY", 3600) // 1 hour
}
