import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
// Import Toast service
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice'
import Ripple from 'primevue/ripple';

const app = createApp(App)


const Noir = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{zinc.50}',
            100: '{zinc.100}',
            200: '{zinc.200}',
            300: '{zinc.300}',
            400: '{zinc.400}',
            500: '{zinc.500}',
            600: '{zinc.600}',
            700: '{zinc.700}',
            800: '{zinc.800}',
            900: '{zinc.900}',
            950: '{zinc.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{zinc.950}',
                    inverseColor: '#ffffff',
                    hoverColor: '{zinc.900}',
                    activeColor: '{zinc.800}'
                },
                highlight: {
                    background: '{zinc.950}',
                    focusBackground: '{zinc.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{zinc.50}',
                    inverseColor: '{zinc.950}',
                    hoverColor: '{zinc.100}',
                    activeColor: '{zinc.200}'
                },
                highlight: {
                    background: 'rgba(250, 250, 250, .16)',
                    focusBackground: 'rgba(250, 250, 250, .24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});


const Platinum = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{neutral.50}',
            100: '{neutral.100}',
            200: '{neutral.200}',
            300: '{neutral.300}',
            400: '{neutral.400}',
            500: '{neutral.500}',
            600: '{neutral.600}',
            700: '{neutral.700}',
            800: '{neutral.800}',
            900: '{neutral.900}',
            950: '{neutral.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{stone.800}',
                    inverseColor: '#ffffff',
                    hoverColor: '{stone.900}',
                    activeColor: '{stone.950}'
                },
                highlight: {
                    background: '{stone.800}',
                    focusBackground: '{stone.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{stone.200}',
                    inverseColor: '{stone.950}',
                    hoverColor: '{stone.100}',
                    activeColor: '{stone.50}'
                },
                highlight: {
                    background: 'rgba(231, 229, 228, 0.16)',
                    focusBackground: 'rgba(231, 229, 228, 0.24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});

const Executive = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.500}',
            600: '{slate.600}',
            700: '{slate.700}',
            800: '{slate.800}',
            900: '{slate.900}',
            950: '{slate.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{indigo.700}',
                    inverseColor: '#ffffff',
                    hoverColor: '{indigo.800}',
                    activeColor: '{indigo.900}'
                },
                highlight: {
                    background: '{indigo.700}',
                    focusBackground: '{indigo.600}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                },
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                }
            },
            dark: {
                primary: {
                    color: '{indigo.300}',
                    inverseColor: '{slate.950}',
                    hoverColor: '{indigo.200}',
                    activeColor: '{indigo.100}'
                },
                highlight: {
                    background: 'rgba(165, 180, 252, 0.16)',
                    focusBackground: 'rgba(165, 180, 252, 0.24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});

const Obsidian = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{gray.50}',
            100: '{gray.100}',
            200: '{gray.200}',
            300: '{gray.300}',
            400: '{gray.400}',
            500: '{gray.500}',
            600: '{gray.600}',
            700: '{gray.700}',
            800: '{gray.800}',
            900: '{gray.900}',
            950: '{gray.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{gray.900}',
                    inverseColor: '#ffffff',
                    hoverColor: '{gray.800}',
                    activeColor: '{gray.700}'
                },
                highlight: {
                    background: '{amber.600}',
                    focusBackground: '{amber.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{amber.400}',
                    inverseColor: '{gray.950}',
                    hoverColor: '{amber.300}',
                    activeColor: '{amber.200}'
                },
                highlight: {
                    background: 'rgba(251, 191, 36, 0.16)',
                    focusBackground: 'rgba(251, 191, 36, 0.24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});

const Corporate = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.500}',
            600: '{slate.600}',
            700: '{slate.700}',
            800: '{slate.800}',
            900: '{slate.900}',
            950: '{slate.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{emerald.700}',
                    inverseColor: '#ffffff',
                    hoverColor: '{emerald.800}',
                    activeColor: '{emerald.900}'
                },
                highlight: {
                    background: '{emerald.700}',
                    focusBackground: '{emerald.600}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{emerald.400}',
                    inverseColor: '{slate.950}',
                    hoverColor: '{emerald.300}',
                    activeColor: '{emerald.200}'
                },
                highlight: {
                    background: 'rgba(52, 211, 153, 0.16)',
                    focusBackground: 'rgba(52, 211, 153, 0.24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Corporate,
        options: {
            darkModeSelector: 'none', // Changed to class-based selector
        }
    }
});

// Add Toast service
app.use(ToastService);
app.use(ConfirmationService)
app.directive('ripple', Ripple);

app.mount('#app')
