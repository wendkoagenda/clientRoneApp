const strings = {
    COMPANY_NAME: 'Rone Engineering',
    BADGE_LABELS: {
        TECHNICIAN: 'Technician: '
    },
    PAGES: {
        HOME: 'Home',
        CLIENTS: 'Business Parties',
        PROJECTS: 'Projects',
        ASSIGNED_PROJECTS: 'Assigned Projects',
        PROJECT_DETAILS: 'Project details',
        DISPATCH: 'Dispatch',
        DISPATCH_LIST: 'Dispatch List',
        WORK_ORDERS_LIST: 'Work Orders',
        USER_MANAGEMENT: 'Admin - Manage Users',
        CUSTOMER_PORTAL: 'Admin - Customer Portal',
        ADD_CLIENT: 'Add New Business Party',
        EDIT_CLIENT: 'Edit Business Party',
        JOURNAL: 'Activity Journal',
        SITES_MANAGEMENT: 'Sites',
        BREAK_LIST: 'Break List',
        BUDGET_SHEET: 'Pricing Table',
        WORK_ORDERS_MANAGEMENT: 'Work Orders',
        INVOICE: 'Billing',
        INVOICE_JOURNAL: 'Billing Journal',
        BUDGET_COMPARISON: 'Budget Comparison',
        PROJECT_MANAGEMENT: {
            ADD: 'Add new project',
            EDIT: 'Edit project'
        },
        DISPATCH_MANAGEMENT: {
            ADD: 'Add new dispatch',
            EDIT: 'Edit dispatch'
        },
        LOGIN: 'Login',
        REPORT_LIST: 'Report List'
    },
    DRAWER_SECTIONS: {
        USERS: 'Users',
        MY_PROFILE: 'My Profile',
        JOURNAL: 'Activity Journal',
        SITE_MANAGEMENT: 'Sites',
        WORK_ORDERS_MANAGEMENT: 'Work Orders',
        BUDGET_SHEET: 'Pricing Table',
        INVOICE: 'Billing',
        INVOICE_JOURNAL: 'Billing Journal',
        REPORT_LIST: 'Report List',
        CUSTOMER_PORTAL: 'Customer Portal'
    },
    COMMON: {
        VIEW_ALL:'View all',
        WELCOME: 'Welcome to',
        SUBMIT: 'Submit',
        SAVE: 'Save',
        SUBMIT_BY_DATE_PICKER: 'Submit by date',
        FORGOT_PASSWORD: 'Forgot password?',
        BACK_TO_LOGIN: 'Back to login',
        PROFILE_DETAILS: 'PROFILE DETAILS',
        PASSWORD: 'PASSWORD',
        CHANGE_PASSWORD: 'Change Password?',
        PASSWORD_CHANGE_SUCCESS: 'Password has been updated.',
        PASSWORD_CHANGE_ERROR: 'It was some error when we changing your password.',
        PROFILE_CHANGE_SUCCESS: 'Profile details have been updated successfully.',
        PROFILE_CHANGE_ERROR: 'It was some error when we editing your profile.',
        CHANGE_PROFILE_DETAILS: 'Change your profile details',
        SORT_BY: 'SORT BY',
        BACK_HOME: 'Back to homepage',
        ADD_USER: 'Add New User',
        DELETE_SUCCESSFUL: 'User has been deleted successfully',
        DELETE_ERROR: 'It was some error when deleting the user',
        CREATE_SUCCESSFUL: 'User has been created successfully',
        CREATE_ERROR: 'Unable to create user',
        GET_USERS_ERROR: 'Unable to get users.',
        EDIT_SUCCESSFUL: 'User has been edited successfully',
        EDIT_ERROR: 'Unable to edit user info.',
        PASSWORD_LABEL: '****************',
        EMPTY_CLIENTS: "You haven't added any Business Parties",
        COMPANY_ID: 'Company ID',
        OFFICE_NUMBER: 'Office Number',
        EMPTY_DISPATCHES: "You haven't added any Dispatches",
        CLIENT_NAME: 'Business Party Name',
        CONTACT_NAME: 'Contact Name',
        EMAIL: 'Email',
        CONTACT_NUMBER: 'Contact Number',
        CONTACT_NUMBER_OFFICE: 'Contact Number (Office)',
        CONTACT_NUMBER_CELL: 'Contact Number (Cell)',
        COMPANY_NAME: 'Company Name',
        ADDRESS: 'Address',
        ADDRESS2: 'Address Line 1',
        CITY: 'City',
        STATE: 'State',
        SITE: 'Site',
        ZIP: 'Zip',
        COUNTRY: 'Country',
        SAME_ADDRESS: 'Select if the address is the same as above',
        ADD_CONTACT: 'Add Contact',
        ADD_CLIENT: 'Add New Business Party',
        EDIT_CLIENT: 'Edit Business Party',
        SAVE_CHANGES: 'Save Сhanges',
        SAVE_CHANGES_CONFIRM: 'Are you sure want to save these changes?',
        ADD_NEW_CLIENT_CONFIRM: 'Are you sure want to add new Business Party?',
        CHANGE_REVISION_STATUS_CONFIRM: 'Are you sure want to change notification status',
        SAVE_DISPATCH: 'Are you sure want to add new dispatch?',
        UNASSIGN_ORDER: 'Are you sure want to unassign this order?',
        UNASSIGN_PROJECT: 'Are you sure want to unassign this project?',
        UNASSIGN_CLIENT: 'Are you sure want to unassign this Business Party?',
        CANCEL_BUTTON_CONFIRM: 'Changes that you made, will be discarded, continue?',
        UNASSIGN_BUTTON_CONFIRM: 'Are you sure want to unassign current record?',
        SELECT_ALL: 'Select All Options',
        FETCH_PROJECTS_ERROR: 'Unable to fetch projects',
        FETCH_CUSTOMERS_ERROR: 'Unable to fetch customers',
        UPDATE_CUSTOMER_ERROR: 'Unable to update customer',
        FETCH_MANAGERS_ERROR: 'Unable to fetch project managers',
        FETCH_RESPONSIBLE_PERSONS_ERROR: 'Unable to fetch responsible persons',
        FETCH_CLIENTS_ERROR: 'Unable to fetch Business Parties',
        FETCH_REPORTS_ERROR: 'Unable to fetch reports',
        FETCH_STATES_ERROR: 'Unable to fetch states',
        FETCH_DISPATCHES_ERROR: 'Unable to fetch dispatches',
        FETCH_TECHNICIANS_ERROR: 'Unable to fetch technicians',
        FETCH_WORK_ORDERS_ERROR: 'Unable to fetch work orders',
        FETCH_COMPLETED_WORK_ORDERS_ERROR: 'Unable to fetch completed work orders',
        FETCH_EMPLOYEES_ERROR: 'Unable to fetch employees for the given Business Party',
        RESET_BTN_TEXT: 'Reset all filters',
        GET_JOURNAL_ERROR: 'Unable to get activity journal',
        GET_SITES_ERROR: 'Unable to load sites',
        DELETE_SITE_ERROR: 'Unable to delete the site',
        UPDATE_SITE_ERROR: 'Unable to update the site',
        CREATE_SITE_ERROR: 'Unable to create the site',
        CLIENT_ID: 'Business Party Id',
        OK: 'OK',
        CANCEL: 'CANCEL',
        CHANGE_STATUS_ERROR: 'Unable to change project status',
        DELETE_PROJECT_ERROR: 'Unable to delete project',
        PROJECT_DELETED: 'Project successfully deleted',
        UNABLE_TO_FETCH_PROJECT_DATA: 'Unable to fetch project data',
        NO_DATA_FOR_THE_CURRENT_PROJECT: 'No data for the current project',
        DELETE_DISPATCH_ERROR: 'Unable to delete dispatch request',
        ADD_PROJECT: 'Add Project',
        EDIT_PROJECT: 'Edit Project',
        FILTER_JRB: 'Filter by JRB',
        FILTER_RONE: 'Filter by Rone',
        CLEAR_FILTERS: 'Clear all filters',
        GO_BACK: 'Go Back',
        DISPATCH_CREATE_ERROR: 'Unable to create dispatch request',
        DISPATCH_EDIT_ERROR: 'Unable to edit dispatch request',
        DISPATCH_CREATED: 'Dispatch successfully added',
        DISPATCH_UPDATED: 'Dispatch successfully updated',
        DISPATCH_DELETED: 'Dispatch successfully deleted',
        DISABLE_USER_CONFIRM_TEXT: (checked) => `Are you sure want to ${checked ? "enable" : "disable"} the current user?`,
        CAN_SYNC_USER_CONFIRM_TEXT: (checked) => `Are you sure want to ${checked ? "allow" : "deny"} sync operation for the current user?`,
        RESTORE_RECORD_CONFIRM_TEXT: 'Are you sure want to restore current record?',
        UNASSIGN: "Unassign",
        RECORD_RESTORED: 'Record successfully restored',
        UNABLE_TO_FETCH_DISPATCHES_PER_PROJECT: 'Unable to fetch dispatches per project',
        UNABLE_TO_OPEN_CURRENT_DISPATCH: 'Unable to open current dispatch',
        LOG_OUT: 'Log out',
        CHANGE_MAP: 'Change map mode',
        SCHEME: 'Road',
        SATELLITE: 'Satellite',
        NOTIFICATION_MODAL: 'Notification Management',
        NOTIFICATION_CONFIRM: 'Send notification for all checked technicians?',
        NOTIFICATION_CONFIRM_UPDATE_TECH_SITES: 'Are you sure want to update technician sites?',
        NOTIFICATION_SENDING_ERROR: 'Unable send notification',
        SELECT_ALL_LABEL: 'Select All',
        SEARCH_TECHNICIAN: 'Search technician',
        TECH_LOCATION: 'Move to technician location ',
        SITE_CHANGING_POPOVER: 'Change Technician Site',
        MOVE_TO_ORDER: 'Move to order',
        NO_LOCATION: 'Coordinates are missing for the current technician',
        TECH_SITES_UPDATED: 'Technician sites updated successfully',
        EDIT_SITE_ERROR: 'Unable to change site',
        UNABLE_TO_ASSIGN: 'Unable to assign work order',
        UNABLE_TO_CANCEL: 'Unable to cancel work order',
        ORDER_DETAILS: 'Order Details',
        NON_ESTIMATED_DATE_CONFIRMATION: 'Are you sure to assign this order on a non-estimated date?',
        SUBMITTED: 'Submitted',
        NOT_SUBMITTED: 'Not Submitted',
        NOTIFICATION_SENT: 'Notification sent',
        LEFT_RESIZE_ERROR: 'Unable to set end date earlier than the start date',
        REASSIGN_CONFIRMED: 'Are you sure to reassign this work, although it has already been confirmed by technician?',
        WORK_ORDER_IS_UNASSIGNED: 'Work Order is unassigned!',
        SITE_IS_DELETED: 'Site is deleted.',
        SITE_IS_UPDATED: 'Site is updated.',
        SITE_IS_CREATED: 'The new Site created.',
        REPORT_APPROVE: 'Are you sure to approve this report?',
        UNABLE_APPROVE_REPORT: 'Unable to approve this report',
        VIEW_REPORT: 'View this report',
        REPORT_UPDATE_ERROR: 'Unable to update this report',
        LOAD_REPORT_ERROR: 'Unable to load this report',
        ONLY_UNAPPROVED: 'Show only unapproved',
        DOWNLOAD_REPORT: 'Download this report',
        OPEN_NOTIFICATION_WINDOW: 'Open notification window',
        UNABLE_DOWNLOAD_REPORT: 'Unable to download this report',
        FIXTURE_REPORT_NOTIFICATION: 'Generic report assigned to the selected work order',
        REPORT_SUBMIT_SUCCESS: 'Report data updated!',
        REPORT_APPROVED_SUCCESS: 'Report approved!',
        USE_BUDGE_CONSTRUCTOR: 'Use budget constructor',
        BUDGET_CONSTRUCTOR: 'Budget Constructor',
        PROVIDE_PRICE_ERROR: 'Provide price for all selected work orders',
        NOT_SET: 'Not set',
        ACTIVE: 'Active',
        NOT_ACTIVE: 'Not active',
        YES: 'Yes',
        NO: 'No',
        SELECT_ORDER: 'Select Orders',
        SEARCH_WORK_ORDER: 'Search Work Order',
        UPLOAD_PROPOSAL_SHEET: 'Upload proposal sheet',
        SETUP_TESTS: 'Setup tests',
        DAYS_VALUE: 'Days value',
        HOURS_VALUE: 'Hours value',
        ADD_SET: 'Add set',
        ADD_SPECIMEN: 'Add specimen',
        REMOVE_SPECIMEN: 'Remove specimen',
        REMOVE_SET: 'Remove set',
        DISABLED_STATE_CHANGE_SUCCESS: 'Disabled state has been changed successfully',
        DISABLED_STATE_CHANGE_ERROR: 'Disabled state changing error',
        CANSYNC_STATE_CHANGE_SUCCESS: 'Can Sync state has been changed successfully',
        CANSYNC_STATE_CHANGE_ERROR: 'Can Sync state changing error',
        REPORT_SUBMITTED: 'Report Submitted',
        RELOAD_MAP: 'Reload map',
        SITE_LOCATION_UNDEFINED: 'There is no site location in the system.',
        FILTER_TECHNICIAN_BY_SITE: 'Filter technicians by site',
        FILTER_ORDERS_BY_SITE: 'Filter orders by site',
        UNABLE_TO_FETCH_NOTIFICATIONS: 'Unable to fetch notifications',
        LOAD_REPORTS_ERROR: 'Unable to load report',
        FULL_TIME_ORDER: 'Full time',
        FULL_TIME_ORDERS: 'Full time orders',
        SELECT_REPORT_TYPE: 'Select report type',
        REMOVE_BUDGET_ORDER: 'Are you sure to remove this order?',
        LEVEL: 'Select level',
        CATEGORY: 'Select category',
        SEARCH: 'Search',
        ALL_CATEGORIES: 'All categories',
        EDIT_BUDGET_SHEET_ERROR: 'Enable to update budget sheet info',
        BUDGET_SHEET_EDIT_SUCCESS: 'Budget sheet record has been changed successfully',
        TRANSPORTATION_CHARGE: 'Transportation charge',
        REPORTS_DISTRIBUTION: 'REPORTS DISTRIBUTION',
        NONE_TRANSPORTATION_CHARGE_MODAL: 'Assigned Work Orders',
        DELETE_REPORT: 'Are you sure to delete this report?',
        REPORT_DELETED: 'Report successfully deleted',
        DELETE_REPORT_ERROR: 'Unable to delete report',
        UPLOAD: 'Upload',
        ADD_DEFAULT_TESTS_PLACEHOLDER: 'Select default set of tests',
        ADD_ITEM: 'Add item',
        ADD_TEST: 'Add test'
    },
    INPUT_RULES: {
        LOGIN: {
            USERNAME_REQUIRED: 'Please input your email or username!',
            PASSWORD_REQUIRED: 'Please input your password!',
            EMAIL_REQUIRED: 'Please input your email'
        },
        COMMON: {
            PHONE_NUMBER: 'Please provide a valid phone number'
        },
        SIGNATURE_IMAGE: 'You can only upload JPG/PNG images. Image must be smaller than 2 MB.'
    },
    FIELD_FORMATS: {
        DEFAULT_DATE_TIME_FORMAT: 'MM-DD-YYYY',
        DEFAULT_DATE_TIME_BREAK_LIST_FORMAT: 'MM/DD/YYYY',
        DEFAULT_DATE_TIME_FORMAT_WITH_TIME: 'MM-DD-YYYY hh:mm',
        DEFAULT_TIME_FORMAT: 'hh:mm A',
        DEFAULT_PHONE_NUMBER_MASK: '(111) 111-1111'
    },
    ERRORS_MESSAGE: {
        LOGIN: {
            INVALID_DATA: 'Invalid username/email or password.',
            BAD_REQUEST: 'Bad request.',
            UNKNOWN_ERROR: 'Unknown error on login. Please, reload the page and try again.',
            USER_IS_DISABLED: 'The current user is disabled.'
        }
    },
    ERROR_PAGES_MESSAGE: {
        NOT_FOUND: 'Sorry, the page you visited does not exist.',
        SERVER_ERROR: 'Sorry, something went wrong.'
    },
    SITES_ID: {
        AUSTIN: 1,
        DALLAS: 2,
        FORT_WORTH: 3,
        HOUSTON: 4,
        SAN_ANTONIO: 5,
        JRB_AUSTIN: 6,
        JRB_DALLAS: 7,
        JRB_FORT_WORTH: 8,
        JRB_HOUSTON: 9,
        JRB_SAN_ANTONIO: 10
    },
    VALIDATE_MESSAGES: {
        REQUIRED: 'The field is required!',
        IS_REQUIRED: ' is required!',
        LEN: (property, len) => `${property} must contain ${len} numbers`,
        ZIP_CODE_NUMBER: 'Zipcode must contain only numbers',
        PROJECT_NUMBER: 'Please provide a valid seven-digit number (eg. 1003317)',
        POSITIVE_NUMBER: 'Please provide a positive number'
    },
    USER_PROPERTIES: {
        ID: 'User ID',
        NAME: 'User Name',
        FULL_NAME: 'Full name',
        ROLE: 'Role',
        SITE: 'Site',
        MAIL: 'Email',
        PASSWORD: 'Password',
        SIGNATURE: 'Signature',
        PHONE_NUMBER: 'Phone number'
    },
    CLIENT_PAGE: {
        INPUT_LABELS: {
            CLIENT_DETAILS: 'BUSINESS PARTY DETAILS',
            BILLING: 'BILLING ADDRESS',
            CONTACT_NAMES: 'CONTACT NAMES',
        },
        NOTIFICATIONS: {
            CREATE_ERROR: 'Unable to create Business Party',
            CREATE_SUCCESSFUL: 'Business Party has been created successfully',
            EDIT_ERROR: 'Unable to edit Business Party',
            EDIT_SUCCESSFUL: 'Business Party has been edited successfully',
            DELETE_SUCCESSFUL: 'Business Party has been deleted successfully',
            DELETE_ERROR: 'It was some error when deleting the Business Party',
        }
    },
    CUSTOMER_PORTAL: {
        CUSTOMER_PROJECTS_UPDATED: 'Customer\'s projects updated',
        NO_PROJECTS_ASSIGNED: 'Currently no Projects assigned, drag and drop projects from the left box',
        ARE_YOU_SURE: 'Are you sure want to save the changes to current customer?',
        SAVE_CHANGES: 'Save changes'
    },
    REPORTS: {
        LABELS: {
            NUMBER: 'No.',
            PROJECT_DATA: 'PROJECT DATA',
            REPORT_OF_TESTS: 'REPORT OF TEST',
            CONCRETE_CYLINDERS: "Concrete Cylinders",
            CONCRETE_POST_TENSION_INSPECTION: "Concrete Post Tension Inspection",
            SOIL_MOISTURE_DENSITY: "Moisture Density Relationship",
            SET: 'SET',
            SET_NUMBER: 'Set Number',
            SET_LOCATION: 'Set Location',
            TENDON_DIAMETER: 'Tendom Diameter',
            SPECIFICATION_GRADE: 'Specification Grade',
            REQUIRED_TENDON_FORCE: 'Required Tendon Force',
            ALLOWABLE_TOLERANCE: 'Allowable Tolerance',
            LOCATION: 'Location',
            TENDON_TYPE: 'Tendon type',
            RAM_NUMBER: 'Ram No.',
            GAUGE_NUMBER: 'Gauge No.',
            CALIBRATION_DATE: 'Calibration Date',
            GAUGE_PRESSURE: 'Gauge Pressure',
            BUILDING_NUMBER: 'Building No.',
            POUR_NUMBER: 'Pour No.',
            LEVEL: 'Level',
            GRID_LINES: 'Grid lines',
            COMMENTS_REMARKS: 'Comments/Remarks',
            TENDON_ID: 'Tendon ID',
            REQUIRED_ELONGATION: 'Required Elongation',
            PRESSURE_FIRST: 'Pressure First',
            ELONGATION_FIRST: 'Elongation First',
            PRESSURE_SECOND: 'Pressure Second',
            ELONGATION_SECOND: 'Elongation Second',
            ELONGATION_SUBTOTAL: 'Elongation Subtotal',
            LIFT_OFF_PRESSURE: 'Lift Off Pressure',
            RESTRESS_ELONGATION: 'Restress Elongation',
            RESTRESS_PRESSURE: 'Restress Pressure',
            TOTAL_ELONGATION: 'Total Elongation',
            PERCENT_ELONGATION: 'Percent Elongation',
            IN_TOLERANCE: 'In Tolerance',
            SPEC_SIZE: 'Spec Size',
            DATE_PLACED: 'Date Placed',
            OVERALL: 'Overall Placement Location',
            BATCH_TIME: 'Batch Time',
            SAMPLE_TIME: 'Sample Time',
            AIR_TEMP: 'Air Temp',
            CONCRETE_TEMP: 'Concrete Temp',
            SLUMP_IN: 'Slump In',
            AIR_CONTENT: 'Air Content',
            UNIT_WEIGHT: 'Unit Weight',
            WEATHER: 'Weather',
            SPECIFICATION: 'Specification',
            DAYS: 'Days',
            SLUMP_LOWER: 'Slump Lower Limit In',
            SLUMP_UPPER: 'Slump Upper Limit In',
            AIR_LOWER: 'Air Lower Limit',
            AIR_UPPER: 'Air Upper Limit In',
            CONCRETE_SUPPLIER: 'Concrete Supplier',
            PLANT: 'Plant',
            TRUCK: 'Truck',
            MIX_CODE: 'Mix Code',
            PICKUP_LOCATION: 'Pickup Location',
            TICKET: 'Ticket',
            REMARKS: 'Remarks',
            ATTACHMENTS: 'Attachments',
            TEST_METHOD: 'Test Method',
            TESTED_BY: 'Tested by',
            SOIL_IN_PLACE_DENSITY_TESTING: 'Soil In Place Density Testing',
            CONTRACTOR: 'Contractor',
            GAUGE: 'Gauge',
            GAUGE_SERIAL: 'Gauge Serial No.',
            TEST_MODE: 'Test Mode',
            MOISTURE_CURRENT: 'Moisture: Current',
            MOISTURE_PREVIOUS: 'Moisture: Previous',
            DENSITY_CURRENT: 'Density: Current',
            DENSITY_PREVIOUS: 'Density: Previous',
            MOISTURE_DENSITY_REPORT: 'M/D No.',
            PROJECT_MOISTURE: 'Project Moisture',
            REQUIREMENTS_DENSITY: 'Requirements Density',
            TEST_LOCATION_TITLE: 'Location Title',
            TEST_LOCATION_SUBTEXT: 'Location Subtext',
            PROBE_DEPTH: 'Probe Depth',
            MOISTURE: 'Moisture %',
            WET_DENSITY: 'Wet Density (pcf)',
            DRY_DENSITY: 'Dry Density (pcf)',
            DENSITY_MAX: 'Density (% max)',
            LIQUID_LIMIT: 'Liquid Limits',
            PLASTIC_LIMIT: 'Plastic Limits',
            PLASTICITY_INDEX: 'Plasticity Index',
            PERCENT_PASS_SIEVE: 'Percent Pass Sieve',
            PROJECT_SPECIFICATIONS_CALCULATIONS: 'Project Specifications Calculations',
            COMPACTION_TEST_CALCULATIONS: 'Compaction Test Calculations',
            MOISTURE_CONTENT_CALCULATIONS: 'Moisture Content Calculations',
            SPECIFIC_GRAVITY: 'Specific Gravity',
            RESULTS: 'Results',
            CHART_STYLE: 'Chart style, \'r\' - regular, \'s\' - smooth [default]',
            SHOW_POINTS: 'Show points, \'y\' - show, \'n\' - don\'t show [default]',
            OVERSIZE_CORRECTION: 'Oversize Correction'
        },
        PROPS_NAME: {
            SET_NUMBER: 'setNumber',
            SET_LOCATION: 'sampleLocation',
            SPEC_SIZE: 'specSize',
            DATE_PLACED: 'datePlaced',
            OVERALL: 'overallPlacementLocation',
            BATCH_TIME: 'batchTime',
            SAMPLE_TIME: 'sampleTime',
            AIR_TEMP: 'airTemp',
            CONCRETE_TEMP: 'concreteTemp',
            SLUMP_IN: 'slumpIn',
            AIR_CONTENT: 'airContent',
            UNIT_WEIGHT: 'unitWeight',
            WEATHER: 'weather',
            SPECIFICATION: 'specification',
            DAYS: 'days',
            SLUMP_LOWER: 'slumpLowerLimitIn',
            SLUMP_UPPER: 'slumpUpperLimitIn',
            AIR_LOWER: 'airLowerLimit',
            AIR_UPPER: 'airUpperLimitIn',
            CONCRETE_SUPPLIER: 'concreteSupplier',
            PLANT: 'plant',
            TRUCK: 'truck',
            MIX_CODE: 'mixCode',
            PICKUP_LOCATION: 'pickupLocation',
            TICKET: 'ticket',
            REMARKS: 'remarks',
            ATTACHMENTS: 'attachments',
            AREA: 'area',
            COMPRESSIVE: 'compressiveStrength',
            DIAMETER: 'diameter',
            MAXIMUM_LOAD: 'maximumLoad',
            FRACTURE: 'fracture',
            TESTED_BY: 'testedBy',
            TEST_METHOD: 'testMethod',
            CONTRACTOR: 'Contractor',
            GAUGE: 'Gauge',
            GAUGE_SERIAL: 'GaugeSerial',
            TEST_MODE: 'TestMode',
            MOISTURE_CURRENT: 'MoistureCurrent',
            MOISTURE_PREVIOUS: 'MoisturePrevious',
            DENSITY_CURRENT: 'DensityCurrent',
            DENSITY_PREVIOUS: 'DensityPrevious',
            MOISTURE_DENSITY_REPORT: 'moistureDensityReport',
            PROJECT_MOISTURE: 'projectMoisture',
            REQUIREMENTS_DENSITY: 'requirementsDensity',
            TEST_LOCATION_TITLE: 'testLocationTitle',
            TEST_LOCATION_SUBTEXT: 'testLocationSubtext',
            PROBE_DEPTH: 'probeDepth',
            MOISTURE: 'moisture',
            WET_DENSITY: 'wetDensity',
            DRY_DENSITY: 'dryDensity',
            DENSITY_MAX: 'densityMax',
            WET_MATERIAL_PLUS_TARE: 'wetMaterialPlusTare',
            DRY_MATERIAL_PLUS_TARE: 'dryMaterialPlusTare',
            TARE: 'tare',
            SPECIFIC_GRAVITY: 'specificGravity',
            NUMBER_OF_BLOWS: 'numberOfBlows',
            PERCENT_OF_WATER_ADDED: 'percentOfWaterAdded',
            MATERIAL_MASS: 'materialMass',
            VOLUME_CONVERSION_FACTOR: 'volumeConversionFactor',
            CAN_NUMBER: 'canNumber',
            PLASTIC_LIMIT: 'plasticLimit',
            LIQUID_LIMIT: 'liquidLimit',
            PLASTICITY_INDEX: 'plasticityIndex',
            PASSING:'passing',
            HEIGHT_OF_MATERIAL: 'heightOfMaterial',
            VOLUME_OF_MOLD: 'volumeOfMold',
            TOTAL_PERCENT_WATER: 'totalPercentWater',
            MATERIALS: 'materials',
            WET_MATERIAL_PLUS_MOLD_TARE: 'wetMaterialPlusMoldTare',
            MOLD_TARE: 'moldTare',
            WET_MASS_PAN_AND_MATERIAL: 'wetMassPanAndMaterial',
            DRY_MASS_PAN_AND_MATERIAL: 'dryMassPanAndMaterial',
            PAN_TARE_MASS: 'panTareMass',
            TENDON_DIAMETER: 'tendonDiameter',
            SPECIFICATION_GRADE: 'specificationGrade',
            REQUIRED_TENDON_FORCE: 'requiredTendonForce',
            ALLOWABLE_TOLERANCE: 'allowableTolerance',
            LOCATION: 'location',
            TENDON_TYPE: 'tendonType',
            RAM_NUMBER: 'ramNo',
            GAUGE_NUMBER: 'gaugeNo',
            CALIBRATION_DATE: 'calibrationDate',
            GAUGE_PRESSURE: 'gaugePressure',
            BUILDING_NUMBER: 'buildingNo',
            POUR_NUMBER: 'pourNo',
            LEVEL: 'level',
            GRID_LINES: 'gridlines',
            COMMENTS_REMARKS: 'commentsRemarks',
            TENDON_ID: 'tendonId',
            REQUIRED_ELONGATION: 'requiredElongation',
            PRESSURE_FIRST: 'pressureFirst',
            ELONGATION_FIRST: 'elongationFirst',
            PRESSURE_SECOND: 'pressureSecond',
            ELONGATION_SECOND: 'elongationSecond',
            ELONGATION_SUBTOTAL: 'elongationSubtotal',
            LIFT_OFF_PRESSURE: 'liftOffPressure',
            RESTRESS_ELONGATION: 'restressElongation',
            RESTRESS_PRESSURE: 'restressPressure',
            TOTAL_ELONGATION: 'totalElongation',
            PERCENT_ELONGATION: 'percentElongation',
            IN_TOLERANCE: 'inTolerance',
        },
        PLACEHOLDERS: {
            WET_MATERIAL_PLUS_TARE: 'Wet Material Plus Tare',
            DRY_MATERIAL_PLUS_TARE: 'Dry Material Plus Tare',
            TARE: 'Tare',
            NUMBER_OF_BLOWS: 'Number Of Blows',
            MOISTURE_CONTENT: 'Moisture Content',
            LIQUID_LIMIT: 'Liquid Limit',
            AVERAGE_LIQUID_LIMIT: 'Average Liquid Limit',
            PLASTIC_LIMIT: 'Plastic Limit',
            PLASTICITY_INDEX: 'Plasticity Index',
            PERCENT_PASS: 'Percent Pass',
            PERCENT_OF_WATER_ADDED: 'Percent Of Water Added',
            MATERIAL_MASS: 'Material Mass',
            WATER_ADDED: 'Water Added',
            ADMIXTURE_MASS: 'Admixture Mass',
            VOLUME_CONVERSION_FACTOR: 'Volume Conversion Factor',
            WET_MATERIAL: 'Wet Material',
            WET_DENSITY_OF_SPECIMEN: 'Wet Density Of Specimen',
            CAN_NUMBER: 'Can Number',
            WATER: 'Water',
            DRY_MATERIAL: 'Dry Material',
            MOISTURE_CONTENT_PERCENT: 'Moisture Content Percent',
            DRY_DENSITY_PCF: 'Dry Density pcf',
            SPECIFIC_GRAVITY: 'Specific Gravity',
            CORRECTION_PERCENTAGE_OF: '% of',
            CORRECTION_PERCENTAGE_MOISTURE: '% of Moisture',
            ZERO_VOIDS_POINT: 'Zero Voids Point',
            HEIGHT_OF_MATERIAL: 'Height Of Material',
            VOLUME_OF_MOLD: 'Volume Of Mold',
            VOLUME_OF_MATERIAL: 'Volume Of Material',
            TOTAL_PERCENT_WATER: 'Total Percent Water',
            MATERIALS: 'Materials',
            WET_MATERIAL_PLUS_MOLD_TARE: 'Wet Material Plus Mold Tare',
            MOLD_TARE: 'Mold Tare',
            WET_DENSITY: 'Wet Density',
            WET_MASS_PAN_AND_MATERIAL: 'Wet Mass Pan And Material',
            DRY_MASS_PAN_AND_MATERIAL: 'Dry Mass Pan And Material',
            PAN_TARE_MASS: 'Pan Tare Mass',
            DRY_MATERIAL_MASS: 'Dry Material Mass',
            WATER_MASS: 'Water Mass'
        },
        REPORT_FETCH_ERROR:' Unable to fetch reports',
    },
    PROJECTS: {
        EMPTY_PROJECTS_LIST_LABEL: "You haven't any Projects",
        ADD_NEW_PROJECT_LABEL: "Add New Project",
        EDIT_PROJECT_LABEL: "Edit",
        PRIMARY_CLIENT: 'Primary Business Party',
        MARK_CLIENT_AS_PRIMARY: 'Mark this Business Party as a primary',
        REVISION_HISTORY: 'Revision history',
        NOTIFICATIONS: {
            CREATE_SUCCESSFUL: 'Project has been created successfully',
            EDIT_SUCCESSFUL: 'Project has been updated successfully',
            BUDGET_STORED: 'Project budget data stored',
            REPORT_UPLOADED: 'Report uploaded successfully',
            UNABLE_TO_UPLOAD_REPORT: 'Unable to upload report',
            UNABLE_TO_LOAD_PREVIEW: 'Unable to load preview',
            UNABLE_TO_DOWNLOAD_REPORT: 'Unable to download report',
            UNABLE_TO_RENEW_REPORT_DATA: 'Unable to renew report data',
            UNABLE_TO_SEND_NOTIFICATIONS: 'Unable to send notifications',
            CONTACTS_NOTIFIED: 'Contacts notifications have been scheduled',
            UNABLE_TO_LOAD_SCHEDULED_NOTIFICATIONS: 'Unable to load scheduled notifications',
            UNABLE_TO_LOAD_REPORT_HISTORY: 'Unable to load report revision history',
            UNABLE_TO_UPDATE_NOTIFICATION_REVISION_STATUS: 'Unable to update notification revision status',
            NOTIFICATION_REVISION_STATUS_UPDATED: 'Notification revision status updated successfully',
            PROJECT_BUDGET_UPLOADED: 'Project Budget uploaded successfully',
            UNABLE_TO_UPLOAD_PROJECT_BUDGET: 'Unable to upload project budget'
        },
        BUDGET_COMPARISON: {
            LABELS: {
                SUMMARY: 'Section Summary',
                SUBCONTRACTOR: 'Subcontractor - ',
                PROJECT_NAME: 'Project - ',
                PREPARED_BY: 'Prepared by - '
            },
            ERRORS: {
                UNABLE_TO_LOAD_BUDGET_COMPARISON: 'Unable to load budget comparison'
            }
        },
        VIEW_HISTORY: 'View revision history',
        REVISION_LABEL: 'Revisioned: ',
        NO_REVISION: 'No revisions',
        PROJECT_MANAGEMENT_FORM: {
            PROPERTIES: {
                NUMBER: 'Project Number',
                SITE: 'Site',
                NAME: "Project Name",
                SHORT_NAME: 'Project Short Name',
                ADDRESS: "Address",
                ADDRESS_LINE: "Address Line 1",
                CITY: "City",
                STATE: "State",
                ZIP: "Zip",
                COUNTRY: "Country",
                BUDGET: 'Budget',
                CLIENT_DETAILS: "BUSINESS PARTY DETAILS",
                CONTACT_DETAILS: "CONTACT DETAILS",
                PROJECT_MANAGER: "PROJECT MANAGER",
                PROJECT_MANAGER_LOWERCASE: "Project manager",
                PROJECT_RESPONSIBLE_PERSON: 'PROJECT RESPONSIBLE PERSON',
                PROJECT_STATUS: "PROJECT STATUS",
                DEFAULT_NUMBER_OF_SPEC: "Default # of Specimens"
            },
            LABELS: {
                ADD_PROJECT: "Add Project",
                CLIENTS: "BUSINESS PARTIES",
                PROJECT_DETAILS: "PROJECT DETAILS",
                CHOOSE_PROJECT_MANAGER: "Choose Project Manager",
                CHOOSE_PROJECT_RESPONSIBLE_PERSON: "Choose Project Responsible Persons",
                IS_ACTIVE: "Is Active",
                IS_TEMPORARY: "Temporary",
                NO_CLIENT_ASSIGNED: 'Currently no Business Parties assigned, drag and drop Business Parties from the left box',
                NO_EMPLOYEES_ASSIGNED: 'Currently no Contacts assigned, drag and drop contacts from the left box',
                MAILING_ADDRESS: 'M: ',
                BILLING_ADDRESS: 'B: ',
                MAILING_AND_BILLING: 'M/B: ',
                ADD_NEW_PROJECT_CONFIRM: 'Are you sure want to add the current project?',
                REPORTS: 'View reports',
                BUDGET_COMPARISON: 'Budget comparison'
            }
        },
        PAYMENTS_RESPONSIBLE: 'Responsible for Payments',
        REPORTS_DISTRIBUTION_UPSERT_ERROR: 'Unable to submit reports distribution data',
        REPORTS_DISTRIBUTION_UPSERT_SUCCESS: 'Reports distribution data updated successfully'
    },

    DISPATCH: {
        ERROR_NOTIFICATIONS: {
            UNABLE_TO_EXPORT_WORK_ORDERS: "Unable to export work orders",
            UNABLE_TO_CREATE_PICKUP_REQUEST: "Pickup request already added"
        },
        LABELS: {
            NO_WORK_ORDERS_ASSIGNED: 'Currently no Work Order assigned, drag and drop work order from the left box',
            ALL_WORK_ORDERS_ARE_COMPLETED: 'All work orders are completed',
            WORK_ORDER: 'WORK ORDER',
            DETAILS: 'DETAILS',
            PROJECT_DETAILS: "PROJECT DETAILS",
            CLIENT_DETAILS: "BUSINESS PARTY DETAILS",
            CONTACT_DETAILS: 'CONTACT_DETAILS',
            SEARCH_WORK_ORDERS: 'Search Work Orders',
            COMPANY_NAME: 'Company Name',
            PROJECT_NAME: "Project Name",
            ADDRESS: "Address",
            ADDRESS_LINE: "Address Line 1",
            CITY: "City",
            STATE: "State",
            ZIP: "Zip",
            CONTACT_NAME: 'Contact Name',
            CONTACT_EMAIL: 'Contact Email',
            CONTACT_DETAILS_LABEL: 'CONTACT DETAILS',
            CONTACT_DETAILS_PLACEHOLDER: 'Contact Details',
            COUNTRY: "Country",
            PHONE_NUMBER: 'Phone Number',
            UNASSIGNED_ORDERS: 'Unassigned Work Orders',
            CALENDAR: 'Calendar times in CST',
            DAY: 'Day',
            WEEK: 'Week',
            FULL_VIEW: 'Full View',
            TECHNICIAN: 'Technician & Trucks',
            WORK_ORDERS: 'Work Orders',
            CLIENTS: 'Business Parties',
            PROJECTS: 'Projects',
            PROJECT_NUMBER: 'Project Number',
            COMPANY_ID: 'Company Id',
            ADD_DISPATCH: 'Add Dispatch',
            EDIT_DISPATCH: 'Save Changes',
            ALL_SITES: 'All Sites',
            NOTES: 'Notes...',
            NOW: 'Now',
            TEMPORARY_CLIENT: 'Temporary Business Party',
            TEMPORARY_SITE: 'Temporary Site',
            CREATE_PICKUP: 'Create pickup request'
        },
    },
    SITE_MANAGEMENT_PAGE: {
        SITE_NAME_PLACEHOLDER: 'Site Name',
        CREATE_NEW_SITE_LABEL: 'Create new Site',
        EDIT_SITE_LABEL: 'Edit Site'
    },
    BREAK_LIST: {
        ERRORS: {
            FETCH_ERROR: 'Unable to fetch break list',
            EXPORT_ERROR: 'Unable to export break list',
            UPDATE_ERROR: 'Unable to update tested by person',
            UPDATE_SPEC_ERROR: 'Unable to update specimen information'
        },
        LABELS: {
            UPDATE_TESTED: 'Update tested by person',
            UPDATE_TESTED_INPUT: 'Tested by',
            UPDATE_SPEC: 'Update specimen information',
            UPDATE: 'Update',
            UPDATE_TESTED_SUBMIT: 'Are you sure update tested by person?',
            UPDATED_SUCCESS: 'Tested by person have been updated successfully.',
            BREAK_AGE: 'Break Age',
            BREAK_DATE: 'Break Date',
            DIAMETER: 'Diameter',
            AREA: 'Area',
            MAXIMUM_LOAD: 'Maximum Load',
            COMPRESSIVE: 'Compressive Strength',
            FRACTURE: 'Fracture Type',
            UPDATED_SPEC: 'Specimen information have been updated successfully.',
            DRY_DENSITY: 'dryDensity',
            MOISTURE_CONTENT: 'moistureContent',
            SEARCH_BY_DATE: 'Search By Date',
            AVERAGE_DIAMETER: 'AVG Diameter',
            CLEAR_SEARCH_BY_DATE: 'Clear',
            TESTED_BY: 'Tested By',
            CYLINDER_SIZE: 'Cylinder size',
            MOISTURE: 'Moisture',
            WET_DENSITY: 'Wet Density'
        },
        PLACEHOLDERS: {
            DRY_DENSITY: 'Dry Density',
            MOISTURE_CONTENT: 'Moisture Content'
        }
    },
    INVOICE: {
        LABELS: {
            CLIENT_NAME: 'Business Party Name:',
            PROJECT_NUMBER: 'Project No. - ',
            PROJECT_NAME: 'Project Name - ',
            PROJECT_MANAGER: 'Project Manager - ',
            DATE: 'Date',
            STATUS: 'Status',
            DISPATCH: 'Dispatch No.',
            BILLING: 'Billing Code',
            DESCRIPTION: 'Description',
            QTY: 'Qty',
            RATE: 'Rate',
            TOTAL: 'Total',
            SAVE: 'Review and Save',
            CANCEL: 'Cancel',
            SAVE_AND_REVIEW: 'Save and Review',
            CLIENT: 'Business Party',
            PROJECT: 'Project',
            PROJECT_MAN: 'Project Manager',
            CREATE_INVOICE_SUCCESS: 'Invoice has been created successfully',
            UPDATE_INVOICE_INFO: 'Data has been updated successfully',
            UPLOAD_INVOICE: 'Click or drag invoice file to this area to create invoice',
            SUBMIT_FILTERS: 'Submit Filters',
            REMOVE_FILTERS: 'Remove Filters',
            METRIC_ID: 'Metric Id',
            IS_INVOICED: 'Is invoiced',
            INVOICE_PDF: 'Invoice.pdf',
            DOWNLOAD: 'Download',
            CREATE: 'Create invoice',
            PREVIEW: 'Preview',
            INVOICE_PREVIEW: 'Invoice Preview',
            PRINT: 'Print',
            SUM_OF_TOTAL: 'Total:',
            DOWNLOAD_ALL: 'Download All',
        },
        ERRORS: {
            LOAD_INVOICE_ERROR: 'Unable to load invoice list',
            PREVIEW_ERROR: 'Unable to preview invoice',
            CREATE_ERROR: 'Unable to create invoice',
            UPDATE_ERROR: 'Unable to update invoice',
            UNABLE_TO_UPDATE_INVOICE_INFO: 'There are no new changes',
            UNABLE_TO_POSTPONE_INVOICE: 'Unable to postpone an invoice',
            UNABLE_TO_SCHEDULE_INVOICE: 'Unable to schedule an invoice',
            UNABLE_TO_DOWNLOAD_INVOICE: 'Unable to download an invoice',
            LOAD_FILTERS_ERROR: 'Unable to load filter props',
            EMPTY_FIELDS: 'Please provide required fields',
            UNABLE_TO_LOAD_INVOICE_PREVIEW: 'Unable to load invoice preview',
            UNABLE_TO_PRINT_INVOICE: 'Unable to print invoice'
        }
    },
    WORK_ORDERS_MANAGEMENT: {
        ERRORS: {
            GET_WORK_ORDERS: 'Unable to get work orders',
            SWITCH_PICKUP_STATUS: 'Unable to change pick up status',
            UNABLE_TO_CREATE_WORK_ORDER: 'Unable to create a work order'
        },
        LABELS: {
            ADD_NEW_WORK_ORDER: 'Add new Work Order',
            CREATE_NEW_WORK_ORDER: 'Create new Work Order',
            IS_PRICING_ITEM: 'Is pricing item'
        },
        NOTIFICATIONS: {
            WORK_ORDER_ADDED: 'Work Order added successfully'
        }
    },
    USERS: {
        NOTIFICATIONS: {
            UPDATED_USER_SUCCESS: 'User has been updated successfully',
            UPDATE_USER_ERROR: 'Unable to update user'
        },
        PROPS_NAME: {
            USER_NAME: 'userName',
            FULL_NAME: 'fullName',
            EMAIL: 'email',
            ROLES: 'roles',
            IS_DISABLED: 'isDisabled',
            CAN_SYNC: 'canSync',
            TITLE: 'signatureTitle',
            PHONE_NUMBER: 'phoneNumber',
            SITES: 'sites',
            ROOT_SITE: 'rootSiteId',
        },
        PLACEHOLDERS: {
            USER_NAME: 'User Name',
            FULL_NAME: 'Full Name',
            EMAIL: 'Email',
            ROLES: 'Roles',
            IS_DISABLED: 'is disabled',
            CAN_SYNC: 'can sync',
            TITLE: 'Signature Title',
            PHONE_NUMBER: 'Phone Number',
            SITES: 'Sites',
            ROOT_SITE: 'Root Site',
            UPDATE_USER: 'Update user info',
            MANAGE_PROJECTS: 'Manage projects'
        }
    },
    DAYS: [
        {
            id: 1,
            name: 'Monday'
        },
        {
            id: 2,
            name: 'Tuesday'
        },
        {
            id: 3,
            name: 'Wednesday'
        },
        {
            id: 4,
            name: 'Thursday'
        },
        {
            id: 5,
            name: 'Friday'
        },
        {
            id: 6,
            name: 'Saturday'
        },
        {
            id: 0,
            name: 'Sunday'
        }
    ],
    NEW_RECORD_ID_VALUE: 0
}

export default strings;