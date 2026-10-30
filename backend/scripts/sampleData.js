// Sample seed data for development and testing

const sampleOrganization = {
  name: "Green City Municipality",
  description: "City-wide air quality monitoring system",
  website: "https://greencity.example.com",
  industry: "Government",
  country: "India",
  city: "New Delhi",
  timezone: "Asia/Kolkata",
  subscriptionPlan: "pro",
  settings: {
    alertThreshold: {
      aqi: 150,
      temperature: 40,
      humidity: 80,
    },
  },
};

const sampleSensors = [
  {
    sensorId: "SENSOR_001",
    name: "Downtown Monitor",
    type: "combined",
    location: {
      name: "Downtown Area",
      latitude: 28.6139,
      longitude: 77.209,
      address: "Central Park, New Delhi",
    },
  },
  {
    sensorId: "SENSOR_002",
    name: "Airport Monitor",
    type: "combined",
    location: {
      name: "Airport Zone",
      latitude: 28.5563,
      longitude: 77.1165,
      address: "International Airport, New Delhi",
    },
  },
  {
    sensorId: "SENSOR_003",
    name: "Industrial Zone Monitor",
    type: "combined",
    location: {
      name: "Industrial Area",
      latitude: 28.3949,
      longitude: 77.1064,
      address: "Industrial Complex, New Delhi",
    },
  },
];

const sampleUser = {
  firstName: "Rajesh",
  lastName: "Kumar",
  email: "rajesh@example.com",
  password: "SecurePassword123!", // Will be hashed
  phone: "+91-9876543210",
  role: "org_admin",
  department: "Environmental",
};

const sampleAQIReading = {
  aqi: 165,
  pollutants: {
    pm2_5: 95,
    pm10: 235,
    no2: 67,
    so2: 15,
    co: 2.3,
    o3: 45,
    co2: 410,
  },
  environmental: {
    temperature: 28,
    humidity: 65,
    pressure: 1013,
    windSpeed: 12,
    windDirection: "NW",
    visibility: 2,
  },
  smokeLevel: 45,
  gasLevel: 35,
  sensorStatus: {
    isOnline: true,
    battery: 85,
    signalStrength: 95,
  },
};

const sampleAlert = {
  type: "aqi_warning",
  severity: "warning",
  title: "High AQI Alert",
  description:
    "AQI has exceeded the safe level of 150. Please take necessary precautions.",
  value: 165,
  threshold: 150,
  unit: "AQI",
  notificationChannels: {
    email: true,
    sms: false,
    push: true,
    inApp: true,
  },
};

const samplePrediction = {
  predictions: [
    {
      timeFrame: "1hour",
      predictedAQI: 170,
      confidenceScore: 92,
      riskLevel: "high",
      pollutants: {
        pm2_5: 98,
        pm10: 245,
        no2: 70,
      },
    },
    {
      timeFrame: "6hours",
      predictedAQI: 185,
      confidenceScore: 85,
      riskLevel: "very_high",
      pollutants: {
        pm2_5: 105,
        pm10: 260,
        no2: 75,
      },
    },
    {
      timeFrame: "12hours",
      predictedAQI: 175,
      confidenceScore: 78,
      riskLevel: "high",
      pollutants: {
        pm2_5: 100,
        pm10: 250,
        no2: 72,
      },
    },
    {
      timeFrame: "24hours",
      predictedAQI: 145,
      confidenceScore: 70,
      riskLevel: "moderate",
      pollutants: {
        pm2_5: 85,
        pm10: 220,
        no2: 65,
      },
    },
  ],
  geminiAnalysis: {
    summary:
      "Air quality is expected to deteriorate over the next 6 hours due to increased wind from industrial areas. Conditions should improve by evening.",
    trends:
      "Rising trend with peak expected around 3 PM, followed by gradual improvement.",
    recommendations:
      "Sensitive groups should avoid outdoor activities. Use air purifiers indoors. Wear N95 masks if going outside.",
  },
};

const insertSampleData = async (mongoose) => {
  try {
    const Organization = mongoose.model("Organization");
    const Sensor = mongoose.model("Sensor");
    const User = mongoose.model("User");
    const AQIHistory = mongoose.model("AQIHistory");
    const Alert = mongoose.model("Alert");
    const Prediction = mongoose.model("Prediction");

    // 1. Create organization
    const org = await Organization.create(sampleOrganization);
    console.log("✓ Sample organization created");

    // 2. Create user
    const user = await User.create({
      ...sampleUser,
      organization: org._id,
    });
    console.log("✓ Sample user created");

    // 3. Create sensors
    const sensors = await Sensor.insertMany(
      sampleSensors.map((sensor) => ({
        ...sensor,
        organization: org._id,
        status: "active",
        isOnline: true,
      }))
    );
    console.log("✓ Sample sensors created");

    // 4. Create AQI readings for each sensor
    for (const sensor of sensors) {
      const readings = [];
      for (let i = 0; i < 30; i++) {
        readings.push({
          sensor: sensor._id,
          organization: org._id,
          aqi: {
            value: 100 + Math.random() * 150,
            category: "moderately_polluted",
            level: "high",
          },
          pollutants: {
            pm2_5: 50 + Math.random() * 100,
            pm10: 100 + Math.random() * 150,
            no2: 40 + Math.random() * 50,
            so2: 10 + Math.random() * 20,
            co: 1 + Math.random() * 4,
          },
          environmental: {
            temperature: 25 + Math.random() * 10,
            humidity: 40 + Math.random() * 40,
            pressure: 1010 + Math.random() * 6,
          },
          timestamp: new Date(Date.now() - i * 3600000),
        });
      }
      await AQIHistory.insertMany(readings);
    }
    console.log("✓ Sample AQI readings created");

    // 5. Create alerts
    const alert = await Alert.create({
      ...sampleAlert,
      organization: org._id,
      sensor: sensors[0]._id,
      recipients: [user._id],
    });
    console.log("✓ Sample alert created");

    // 6. Create prediction
    const prediction = await Prediction.create({
      ...samplePrediction,
      sensor: sensors[0]._id,
      organization: org._id,
    });
    console.log("✓ Sample prediction created");

    console.log("\n✓ All sample data inserted successfully!");
    console.log(`
Organization ID: ${org._id}
User ID: ${user._id}
Sensor IDs: ${sensors.map((s) => s._id).join(", ")}
Alert ID: ${alert._id}
Prediction ID: ${prediction._id}
    `);
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
};

module.exports = {
  sampleOrganization,
  sampleSensors,
  sampleUser,
  sampleAQIReading,
  sampleAlert,
  samplePrediction,
  insertSampleData,
};
