/**
 * Mega menu data – ported from mega-menu-demo.
 * Structure: ecosystem (L1) → listing/category → item → listing → product
 */

export type L1Item = {
  id: string
  label: string
  description?: string
}

export type L2MainItem = string | { label: string; showArrow?: boolean }

export type L2Config = {
  mainItems: L2MainItem[]
  helpfulLinks: string[]
}

export type BusinessL3 = {
  id: string
  label: string
  showArrow: boolean
  listings: { title: string; products: { title: string; desc?: string }[] }[]
}

export type BusinessL2 = {
  id: string
  label: string
  helpfulLinks: string[]
  l3: BusinessL3[]
}

export type MobileAppsServices = {
  id: string
  label: string
  listings: { title: string; products: { title: string; desc?: string }[] }[]
}

export const L1_CONFIG: L1Item[] = [
  { id: 'mobile', label: 'Mobile', description: 'Plans, devices, and services for your mobile life.' },
  { id: 'home', label: 'Home', description: 'Broadband, entertainment, and smart home solutions.' },
  { id: 'business', label: 'Business', description: 'Connectivity, cloud, and enterprise solutions.' },
]

export const L2_CONFIG: Record<string, L2Config> = {
  mobile: {
    mainItems: [
      'Prepaid',
      'Postpaid',
      'International',
      { label: 'Apps & Services', showArrow: true },
      { label: 'Devices', showArrow: true },
    ],
    helpfulLinks: ['Get Jio SIM', 'Recharge', 'Pay bills'],
  },
  home: {
    mainItems: ['Browse plans', 'Apps & services', 'Devices'],
    helpfulLinks: ['Pay bills', 'Get JioHome'],
  },
  business: {
    mainItems: ['Connectivity', 'Cloud', 'IOT', '5G solutions'],
    helpfulLinks: ['Resources', 'Contact us', 'Request callback'],
  },
}

export const BUSINESS_L2: BusinessL2[] = [
  {
    id: 'connectivity',
    label: 'Connectivity',
    helpfulLinks: ['Network Assessment', 'Get a Quote', 'Support Portal', 'Documentation'],
    l3: [
      {
        id: 'connectivity',
        label: 'Connectivity',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'Cloud Connect', desc: 'Secure cloud connectivity.' }, { title: 'MPLS VPN', desc: 'Private MPLS-based wide area network.' }, { title: 'Internet Leased Line', desc: 'Dedicated internet access.' }, { title: 'GrowNet Solutions', desc: 'Scalable network solutions for growth.' }, { title: 'JioBusiness Solution', desc: 'Integrated business connectivity.' }, { title: 'Jio True 5G', desc: 'True 5G network for business.' }, { title: 'JioFi', desc: 'Portable Wi-Fi hotspot devices.' }, { title: 'SD-WAN', desc: 'Software-defined wide area networking.' }, { title: 'Managed Wi-Fi', desc: 'Managed wireless LAN services.' }] },
          { title: 'Marketing Solution', products: [{ title: 'Toll Free Service', desc: 'Toll-free numbers for customer contact.' }] },
          { title: 'Voice & collab', products: [{ title: 'IP Centrex', desc: 'Cloud-based business phone system.' }, { title: 'Jio Meet', desc: 'Video and audio conferencing.' }, { title: 'SIP Trunk', desc: 'SIP trunking for voice.' }, { title: 'Toll Free Service', desc: 'Toll-free numbers for customer contact.' }] },
          { title: 'Biz App', products: [{ title: 'JioAttendance', desc: 'Attendance and workforce tracking.' }] },
        ],
      },
      {
        id: 'security',
        label: 'Security',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'DDoS Mitigation', desc: 'Protect against DDoS attacks.' }, { title: 'Threat & Vulnerability Management', desc: 'Identify and remediate vulnerabilities.' }, { title: 'NetSensor', desc: 'Network monitoring and detection.' }, { title: 'CyberSOC', desc: 'Security operations centre services.' }] },
        ],
      },
      {
        id: 'mobile',
        label: 'Mobile',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'Jio True 5G', desc: 'True 5G for mobile business.' }, { title: 'JioConnect', desc: 'IoT and device connectivity.' }, { title: 'JioFi', desc: 'Portable Wi-Fi for teams.' }, { title: 'Jio 4G Service', desc: 'Reliable 4G mobile data.' }] },
        ],
      },
      {
        id: 'global-carrier',
        label: 'Global Carrier',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'International Private Leased Circuit', desc: 'Dedicated international connectivity.' }, { title: 'Data Centre Interconnect', desc: 'Connect data centres globally.' }, { title: 'Global Ethernet', desc: 'Ethernet services worldwide.' }, { title: 'Global MPLS', desc: 'Global MPLS VPN.' }, { title: 'Jio Routes', desc: 'Optimised global routing.' }, { title: 'IP Transit', desc: 'IP transit and backbone access.' }, { title: 'RIO+BH', desc: 'Roaming and bilateral services.' }, { title: 'International Voice', desc: 'International voice and SIP.' }, { title: 'Value Added Services', desc: 'VAS for carriers.' }, { title: 'Mobile Identity API', desc: 'Mobile identity and verification.' }] },
        ],
      },
      {
        id: 'cpaas-jiox',
        label: 'CPaaS - JioCX',
        showArrow: true,
        listings: [
          { title: 'Products', products: [{ title: 'JioCX SMS', desc: 'SMS API for business messaging.' }, { title: 'JioCX Email', desc: 'Transactional email delivery.' }, { title: 'JioCX Voice', desc: 'Voice API for calls.' }, { title: 'JioCX RCS', desc: 'Rich Communication Services.' }, { title: 'JioCX WhatsApp', desc: 'WhatsApp Business API.' }, { title: 'JioCX Alerts', desc: 'Alert and notification services.' }] },
          { title: 'Business Solutions', products: [{ title: 'JioCX EasyPhone', desc: 'Virtual phone numbers for business.' }, { title: 'JioCX EasyListing', desc: 'List and manage business presence.' }] },
        ],
      },
      { id: 'jio-ads', label: 'Jio Ads', showArrow: false, listings: [] },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud',
    helpfulLinks: ['Cloud Migration', 'Pricing Calculator', 'Compliance Guide', 'API Docs'],
    l3: [
      {
        id: 'aicloud',
        label: 'AICloud',
        showArrow: true,
        listings: [
          {
            title: 'AI Cognitive Services',
            products: [
              { title: 'Optical Character Recognition', desc: 'Extract text from images and documents.' },
              { title: 'Document Translation', desc: 'Automated document translation across languages.' },
              { title: 'Entity Extraction', desc: 'Identify and extract named entities from text.' },
              { title: 'Document Data Extraction', desc: 'Pull structured data from unstructured documents.' },
              { title: 'Language Translation', desc: 'Translate content between multiple languages.' },
              { title: 'Text Translation', desc: 'Real-time text translation API.' },
              { title: 'Speech Translation', desc: 'Translate spoken audio in real time.' },
              { title: 'Text to Speech', desc: 'Convert text into natural-sounding speech.' },
              { title: 'Speech to Text', desc: 'Transcribe audio and video to text.' },
              { title: 'Sentiment Analysis', desc: 'Detect sentiment and opinion in text.' },
              { title: 'Content Summarisation', desc: 'Generate concise summaries from long content.' },
              { title: 'PII Detection & Redaction', desc: 'Find and redact personally identifiable information.' },
              { title: 'PII Redaction', desc: 'Automated redaction of sensitive data.' },
              { title: 'Content Moderation', desc: 'Detect and filter inappropriate content.' },
              { title: 'Transcription', desc: 'Accurate transcription for audio and video.' },
              { title: 'Transliteration', desc: 'Convert text between writing systems.' },
              { title: 'Video Analytics', desc: 'Analyse video content with AI.' },
            ],
          },
          {
            title: 'API Gateway',
            products: [
              { title: 'Rate Limiting', desc: 'Control API request rates and quotas.' },
              { title: 'Manage Attributes', desc: 'Configure and manage API attributes.' },
              { title: 'API Keys', desc: 'Secure access with API key management.' },
            ],
          },
        ],
      },
      {
        id: 'cloudxp',
        label: 'CloudXP',
        showArrow: true,
        listings: [
          {
            title: 'Core Foundations CloudXP',
            products: [
              { title: 'Onboarding services', desc: 'Streamlined onboarding for cloud services.' },
              { title: 'Provisioning', desc: 'Automated resource provisioning and lifecycle.' },
              { title: 'Process Automation', desc: 'Automate workflows and processes.' },
              { title: 'Cost Engineering', desc: 'Optimise cloud spend and efficiency.' },
              { title: 'Resource Management', desc: 'Centralised cloud resource management.' },
              { title: 'Analytics and Measurement', desc: 'Track usage and performance metrics.' },
              { title: 'ITSM/ITOM', desc: 'IT service and operations management.' },
              { title: 'AIOps', desc: 'AI-driven operations and incident management.' },
              { title: 'Cost Analysis', desc: 'Detailed cost breakdown and reporting.' },
              { title: 'Cost Governance', desc: 'Policies and controls for cloud spend.' },
              { title: 'Cost Chargeback', desc: 'Allocate and charge back cloud costs.' },
            ],
          },
          {
            title: 'FinOps',
            products: [
              { title: 'Cost Analysis', desc: 'Understand and analyse cloud costs.' },
              { title: 'Cost Governance', desc: 'Govern and control cloud expenditure.' },
              { title: 'Cost Chargeback', desc: 'Charge back costs to teams or projects.' },
              { title: 'Spot Savings', desc: 'Save with spot and preemptible instances.' },
            ],
          },
          {
            title: 'SecOps',
            products: [
              { title: 'SIEM', desc: 'Security information and event management.' },
              { title: 'VA', desc: 'Vulnerability assessment and scanning.' },
              { title: 'RA', desc: 'Risk assessment and compliance reporting.' },
            ],
          },
          {
            title: 'Standalone Services',
            products: [
              { title: 'Resource Management', desc: 'Manage and organise cloud resources.' },
              { title: 'Usage Tracking', desc: 'Track resource and API usage.' },
              { title: 'Log Analysis', desc: 'Search and analyse log data.' },
            ],
          },
        ],
      },
      { id: 'ms-azure', label: 'MS Azure', showArrow: false, listings: [] },
    ],
  },
  {
    id: 'iot',
    label: 'IOT',
    helpfulLinks: ['Device Onboarding', 'Data Explorer', 'Security Best Practices', 'Case Studies'],
    l3: [
      {
        id: 'solutions',
        label: 'Solutions',
        showArrow: true,
        listings: [
          { title: 'Energy Efficiency and Sustainability', products: [{ title: 'Diesel Generator', desc: 'Monitor and optimise generator performance.' }, { title: 'Smart HVAC', desc: 'Smart heating, cooling and ventilation.' }, { title: 'Sub metering', desc: 'Granular energy sub-metering.' }, { title: 'Smart Lighting', desc: 'Automated and efficient lighting.' }, { title: 'Temperature Monitoring', desc: 'Real-time temperature sensing.' }, { title: 'Jio Smart Microinverter', desc: 'Solar microinverter monitoring.' }] },
          { title: 'Operation Efficiency', products: [{ title: 'Diesel Generator', desc: 'Generator monitoring and control.' }, { title: 'Jio Sparq Microinverter', desc: 'Solar and storage monitoring.' }, { title: 'Digital Signages', desc: 'Digital signage management.' }, { title: 'Smart lighting', desc: 'Connected lighting control.' }, { title: 'Workforce Management', desc: 'Track and manage workforce.' }, { title: 'Fleet management', desc: 'Vehicle and fleet tracking.' }, { title: 'Temperature monitoring', desc: 'Environmental monitoring.' }, { title: 'Battery management system', desc: 'Battery health and performance.' }, { title: 'Smart HVAC', desc: 'HVAC monitoring and optimisation.' }, { title: 'Battery swapping solution', desc: 'EV battery swap management.' }, { title: 'Asset tracking', desc: 'Track assets in real time.' }] },
          { title: 'Connected Vehicle', products: [{ title: 'Fleet management', desc: 'Fleet tracking and analytics.' }, { title: 'AvniOS', desc: 'Vehicle OS and applications.' }, { title: 'EV charging', desc: 'EV charging network management.' }, { title: 'Vehicle telematics for auto OEMs', desc: 'Telematics for vehicle makers.' }, { title: 'Battery management system', desc: 'Battery monitoring for EVs.' }, { title: 'JioXplor', desc: 'Exploration and mapping tools.' }, { title: 'Battery swapping solution', desc: 'Battery swap for electric vehicles.' }, { title: 'Jio auto apps suite', desc: 'In-car apps and services.' }] },
          { title: 'Lifestyle', products: [{ title: 'Digital signage', desc: 'Digital display management.' }, { title: 'Jio auto apps suite', desc: 'Connected car applications.' }, { title: 'JHES', desc: 'Home energy solutions.' }] },
          { title: 'Safety & Security', products: [{ title: 'Jio Secure', desc: 'Security and surveillance.' }, { title: 'Smart Outdoor lighting', desc: 'Outdoor lighting with sensors.' }, { title: 'Jio Talkie', desc: 'Push-to-talk communication.' }] },
          { title: 'Agriculture', products: [{ title: 'JioKrishi', desc: 'Agricultural IoT and insights.' }, { title: 'JioGauSamridhhi', desc: 'Livestock and dairy solutions.' }] },
          { title: 'Energy & utilities', products: [{ title: 'Smart lighting', desc: 'Smart lighting for utilities.' }, { title: 'Jio Sparq Microinverter', desc: 'Solar monitoring for utilities.' }, { title: 'Electricity metering', desc: 'Smart electricity meters.' }, { title: 'Water metering', desc: 'Smart water metering.' }, { title: 'Gas metering', desc: 'Smart gas metering.' }] },
          { title: 'Payments Platform', products: [{ title: 'Voice Box', desc: 'Voice-enabled payments.' }, { title: 'Smart Standee', desc: 'Interactive payment kiosks.' }, { title: 'JioPOS', desc: 'Point of sale solutions.' }] },
        ],
      },
      {
        id: 'industries',
        label: 'Industries',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'Retail', desc: 'IoT solutions for retail.' }, { title: 'Manufacturing', desc: 'Smart manufacturing IoT.' }, { title: 'BFSI', desc: 'Banking and financial services.' }, { title: 'Hospitality', desc: 'Hotels and hospitality IoT.' }, { title: 'Healthcare', desc: 'Healthcare IoT solutions.' }, { title: 'Real Estate/Smart Cities', desc: 'Smart city and real estate.' }, { title: 'Automotive Logistics', desc: 'Logistics and automotive.' }, { title: 'Energy & utilities', desc: 'Energy and utility IoT.' }] },
        ],
      },
      {
        id: 'partner-program',
        label: 'Partner Program',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'IOT Accelerator Program', desc: 'Accelerate IoT product development.' }, { title: 'Channel Partner Program', desc: 'Partner programme for IoT.' }] },
        ],
      },
      {
        id: 'devices',
        label: 'Devices',
        showArrow: true,
        listings: [
          { title: 'General List', products: [{ title: 'JioTag Air', desc: 'Compact IoT tracker.' }, { title: 'JioTag go', desc: 'Portable asset tracker.' }] },
        ],
      },
      { id: 'blog', label: 'Blog', showArrow: false, listings: [] },
      { id: 'about-us', label: 'About Us', showArrow: false, listings: [] },
    ],
  },
  {
    id: '5g-solutions',
    label: '5G solutions',
    helpfulLinks: ['5G Coverage Checker', 'ROI Calculator', 'Schedule Site Survey', 'Implementation Guide'],
    l3: [
      {
        id: 'offerings',
        label: 'Offerings',
        showArrow: true,
        listings: [
          { title: 'Discover', products: [{ title: '5G Radio Products', desc: '5G radio access products.' }, { title: '5G Outdoor Small Cell', desc: 'Outdoor small cell solutions.' }, { title: '5G mmWave Radio', desc: 'Millimetre-wave 5G radio.' }, { title: 'Indoor Small Cell', desc: 'Indoor 5G coverage.' }, { title: 'Integrated 5G Indoor Small Cell', desc: 'All-in-one indoor 5G.' }, { title: '5G NR Macro gNodeB', desc: 'Macro cell 5G NR base station.' }, { title: '5G Integrated Macro gNodeB', desc: 'Integrated macro 5G.' }, { title: 'Pico Small Cell', desc: 'Pico cell for dense areas.' }] },
          { title: '5G/4G Combo Core', products: [{ title: '5G on the Edge', desc: 'Edge-deployed 5G core.' }, { title: 'Network Slicing & Discovery Platform', desc: 'Slice lifecycle and discovery.' }, { title: 'Unified Subscriber Data Management Suite', desc: 'Unified subscriber data.' }, { title: 'Converged Policy Control', desc: 'Policy and charging control.' }, { title: '5G Charging & Policy Gateway', desc: 'Charging and policy for 5G.' }, { title: 'Telco Cloud Service Mesh Platform', desc: 'Service mesh for telco cloud.' }, { title: 'Session Binding', desc: 'Session and binding management.' }, { title: '4G/5G Voice, Video & SMS over NR', desc: 'Voice, video and SMS on 5G.' }, { title: '5G Network Exposure & Monetisation', desc: 'Expose and monetise 5G APIs.' }, { title: 'Location Control Services Platform', desc: 'Location services for 5G.' }, { title: '5G Analytics Engine', desc: 'Analytics for 5G networks.' }, { title: 'UE Capability Management', desc: 'Manage UE capabilities.' }] },
        ],
      },
      { id: 'use-cases', label: 'Use Cases', showArrow: false, listings: [] },
      {
        id: 'technologies',
        label: 'Technologies',
        showArrow: true,
        listings: [
          { title: 'Discover', products: [{ title: 'AI Networks', desc: 'AI for network operations.' }, { title: 'Edge Computing', desc: 'Edge compute for 5G.' }, { title: 'MLaaS', desc: 'Machine learning as a service.' }, { title: '5G Advanced', desc: 'Next-phase 5G features.' }, { title: 'Network Slicing', desc: 'Dedicated network slices.' }, { title: '6G', desc: 'Research and roadmap for 6G.' }] },
        ],
      },
      { id: 'resources', label: 'Resources', showArrow: false, listings: [] },
    ],
  },
]

export const MOBILE_APPS_SERVICES: MobileAppsServices = {
  id: 'apps-services',
  label: 'Apps & Services',
  listings: [
    {
      title: 'Apps & Services',
      products: [
        { title: 'MyJio', desc: 'Your Jio account and services in one app.' },
        { title: 'JioPC', desc: 'PC and laptop connectivity.' },
        { title: 'JioTV+', desc: 'Stream TV and entertainment.' },
        { title: 'JioGames', desc: 'Mobile gaming platform.' },
        { title: 'JioPhotos', desc: 'Photos and cloud storage.' },
        { title: 'JioSaavn', desc: 'Music streaming.' },
        { title: 'JioNews', desc: 'News and articles.' },
        { title: 'JioAICloud', desc: 'AI and cloud services.' },
        { title: 'JioHome', desc: 'Smart home and IoT.' },
        { title: 'JioJoin', desc: 'VPN and secure access.' },
        { title: 'JioMeet', desc: 'Video meetings and calls.' },
        { title: 'JioSphere', desc: 'Business and productivity.' },
        { title: 'JioCentrex', desc: 'Central exchange services.' },
        { title: 'JioGate', desc: 'Security and access control.' },
        { title: 'Home surveillance', desc: 'Home security and monitoring.' },
        { title: 'JioMart', desc: 'Online shopping and delivery.' },
        { title: 'JioFinance', desc: 'Payments and finance.' },
        { title: 'JioHealth', desc: 'Health and wellness.' },
        { title: 'JioPOSLite', desc: 'Point of sale for merchants.' },
        { title: 'JioTranslate', desc: 'Translation and language.' },
        { title: 'JioChat', desc: 'Messaging and chat.' },
        { title: 'JioMessages', desc: 'SMS and messaging.' },
        { title: 'JioSafe', desc: 'Safe and secure storage.' },
      ],
    },
  ],
}
