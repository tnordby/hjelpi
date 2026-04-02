export type HomeCategory = {
  id: 'fotografi' | 'hundepasning' | 'tryllekunstnere' | 'renhold' | 'handverker'
  href: string
  imageSrc: string
  icon: string
  large?: boolean
}

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: 'fotografi',
    href: '/fotografi',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjeiHheXRhTo4XOdj59neGSUZhKp5eHEzhlCPj4FJ-79_UGvpGGEwG6_yZq2beFWKaNCx59UIeelTmC_2Eoyd2gIICaonFVCf6wCRmDUjF2LoJtKCZojDmga99OIJh7Fihatrm3YbUvXt9EON8APerqdQa2tsuSP81o-Z71Xl3FQkTazkmCVRga59dSZs2jjCpRVzhnkAyOfH1wvfh5a79oNwd5A3g60s8Izouwf2eeW4EJkDckxIoi5qw3UDCIPwtLxaSbq2L5yv',
    icon: 'photo_camera',
    large: true,
  },
  {
    id: 'hundepasning',
    href: '/dyrepass',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCD8MB2fZRuOq19oPyCUSw1Mv2QWUP8ZTi1UyVZPpo7SVdTZA8eoOaBl_qrJUZmAX7ILgPSTSGuQP7COmn_tz_76j4pETMv2gX_A5mGruKZsNAjYHp4ZblyNhhF1AYonPjvGVMXP31DQnTAIw6V43klWNRZ-PZmEQL2k65rzraghrKaT8fs7wJyavy8obi1rG6GBsXbI8Mmm_seyJgKwMRu4XWbBfF17vM73t7bAUorfj0FBPSO5kj_Nn2JhgG8y6nw1ukCeMBHjyPR',
    icon: 'pets',
  },
  {
    id: 'tryllekunstnere',
    href: '/underholdning',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCyjboJTq2wzuI5zVi9_g2Uj4jr12rl_6BZo_zVsHXMHqGUX8JDhPRq6qQ2uwVilqT-2CgfqrDUzcMZE9L_DUGAYgl1VzvmIgylYb_mHUyHdbHMEJzm4TlSXliELN5j_ezyOv2EcPu1WufJc__prwYlnkBO-6DdTivqMhdiODGjEk5g16hpmRvio81ngUu0XUz7t-6caNKTm5jVvCC80d-AmeCLQ9ui3ShyaalYo1eVIv2nmliihhpa4PSncTYP9Boe2QJ9pFCQ-WZh',
    icon: 'magic_button',
  },
  {
    id: 'renhold',
    href: '/renhold',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlE9IRa1ooLa9cr3pkKlqxGoMHc_Brb2VOMmnwOrlo2Dt_yQQFzY6lLBtohG3wwGKDa1FtlQdOZK6MuvSg8iUMHrgV2s4zv72vgHjqEs2LRXsvkZpnMDXU0xxa4P3NDCa_3nEsN_TDA0RSnXSmoNHg3ybywM6zxzswBm4hBJ7dp0mv7Mz5Uv3gh3rrBGvpQbq4nYkOpVGefuQAaK17ZmyhQlZqLyGMKs0OJLhjBVoWC2UkdaGrGvpOEa1Sz7ubYEgyT_89RFiZbyKV',
    icon: 'cleaning_services',
  },
  {
    id: 'handverker',
    href: '/handverker',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC22NRGOngoypeQO_2nrh1UG_DEPlsScqBdyGTlefg_aTPh0NdCv675TD5TjF151JqTcBabBGem-4saopnGq1DRTVQW4OLTnL3LSKi6drlophLfzpcpeZWe7rY0lm8Rr0d-GLyt6DiEjqhOI0z2hBMbpwiC9hhKiIRwnnNbb79_zkCvRK6DWKH_cceIa1ckxFMb_uZMYXF0X51WsDlmeYV90Soup7yieT3-1qty9UDO9wIat97wdtl17bOVfCmXFyqi8umtHbEszGlU',
    icon: 'handyman',
  },
]
