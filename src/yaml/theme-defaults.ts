/**
 * Theme defaults — per-theme design overrides.
 *
 * Ported from RenderCV's classic_theme.py (classic defaults) and
 * other_themes/*.yaml (theme-specific overrides).
 *
 * Each theme provides a partial `design` object that is deep-merged
 * with the classic defaults. The `theme` field itself is included
 * so the resolved design knows which theme was selected.
 */
import type { ThemeName } from "@/types/cv";

/** Deep partial of the design object (all fields optional). */
type DesignDefaults = Record<string, unknown>;

/**
 * Classic theme defaults — the base for all other themes.
 * Ported from classic_theme.py field defaults.
 */
const classicDefaults: DesignDefaults = {
  page: {
    size: "us-letter",
    top_margin: "0.7in",
    bottom_margin: "0.7in",
    left_margin: "0.7in",
    right_margin: "0.7in",
    show_footer: true,
    show_top_note: true,
  },
  colors: {
    body: "rgb(0, 0, 0)",
    name: "rgb(0, 79, 144)",
    headline: "rgb(0, 79, 144)",
    connections: "rgb(0, 79, 144)",
    section_titles: "rgb(0, 79, 144)",
    links: "rgb(0, 79, 144)",
    footer: "rgb(128, 128, 128)",
    top_note: "rgb(128, 128, 128)",
  },
  typography: {
    line_spacing: "0.6em",
    alignment: "justified",
    date_and_location_column_alignment: "right",
    font_family: {
      body: "Libertinus Serif",
      name: "Libertinus Serif",
      headline: "Libertinus Serif",
      connections: "Libertinus Serif",
      section_titles: "Libertinus Serif",
    },
    font_size: {
      body: "10pt",
      name: "30pt",
      headline: "10pt",
      connections: "10pt",
      section_titles: "1.4em",
    },
    small_caps: {
      name: false,
      headline: false,
      connections: false,
      section_titles: false,
    },
    bold: {
      name: true,
      headline: false,
      connections: false,
      section_titles: true,
    },
  },
  links: {
    underline: false,
    show_external_link_icon: false,
  },
  header: {
    alignment: "center",
    photo_width: "3.5cm",
    photo_space_left: "0.4cm",
    photo_space_right: "0.4cm",
    space_below_name: "0.7cm",
    space_below_headline: "0.7cm",
    space_below_connections: "0.7cm",
    connections: {
      hyperlink: true,
      show_icons: true,
      display_urls_instead_of_usernames: false,
      separator: "",
      space_between_connections: "0.5cm",
      phone_number_format: "national",
    },
  },
  section_titles: {
    type: "with_partial_line",
    line_thickness: "0.5pt",
    space_above: "0.5cm",
    space_below: "0.3cm",
  },
  sections: {
    allow_page_break: true,
    space_between_regular_entries: "1.2em",
    space_between_text_based_entries: "0.3em",
    show_time_spans_in: ["experience"],
  },
  entries: {
    date_and_location_width: "4.15cm",
    side_space: "0.2cm",
    space_between_columns: "0.1cm",
    allow_page_break: false,
    short_second_row: true,
    degree_width: "1cm",
    summary: {
      space_left: "0cm",
      space_above: "0cm",
    },
    highlights: {
      bullet: "•",
      nested_bullet: "•",
      space_left: "0.15cm",
      space_above: "0cm",
      space_between_items: "0cm",
      space_between_bullet_and_text: "0.5em",
    },
  },
  templates: {
    footer: "*NAME -- PAGE_NUMBER/TOTAL_PAGES*",
    top_note: "*LAST_UPDATED CURRENT_DATE*",
    single_date: "MONTH_ABBREVIATION YEAR",
    date_range: "START_DATE – END_DATE",
    time_span: "HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS",
    one_line_entry: {
      main_column: "**LABEL:** DETAILS",
    },
    education_entry: {
      main_column: "**INSTITUTION**, AREA\nSUMMARY\nHIGHLIGHTS",
      degree_column: "**DEGREE**",
      date_and_location_column: "LOCATION\nDATE",
    },
    normal_entry: {
      main_column: "**NAME**\nSUMMARY\nHIGHLIGHTS",
      date_and_location_column: "LOCATION\nDATE",
    },
    experience_entry: {
      main_column: "**COMPANY**, POSITION\nSUMMARY\nHIGHLIGHTS",
      date_and_location_column: "LOCATION\nDATE",
    },
    publication_entry: {
      main_column: "**TITLE**\nSUMMARY\nAUTHORS\nURL (JOURNAL)",
      date_and_location_column: "DATE",
    },
  },
};

/**
 * Theme-specific overrides. Each theme is a partial design object
 * that gets deep-merged with classicDefaults.
 */
const themeOverrides: Record<Exclude<ThemeName, "classic">, DesignDefaults> = {
  moderncv: {
    typography: {
      line_spacing: "0.6em",
      font_family: {
        body: "Fontin",
        name: "Fontin",
        headline: "Fontin",
        connections: "Fontin",
        section_titles: "Fontin",
      },
      font_size: {
        name: "25pt",
        section_titles: "1.4em",
      },
      bold: {
        name: false,
        section_titles: false,
      },
    },
    header: {
      alignment: "left",
      photo_width: "4.15cm",
      photo_space_left: "0cm",
      photo_space_right: "0.3cm",
    },
    links: {
      underline: true,
    },
    section_titles: {
      type: "moderncv",
      space_above: "0.55cm",
      space_below: "0.3cm",
      line_thickness: "0.15cm",
    },
    sections: {
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: false,
      side_space: "0cm",
      space_between_columns: "0.3cm",
      summary: { space_above: "0.1cm" },
      highlights: {
        space_left: "0cm",
        space_above: "0.15cm",
        space_between_items: "0.1cm",
        space_between_bullet_and_text: "0.3em",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },

  sb2nov: {
    typography: {
      font_family: {
        body: "New Computer Modern",
        name: "New Computer Modern",
        headline: "New Computer Modern",
        connections: "New Computer Modern",
        section_titles: "New Computer Modern",
      },
    },
    colors: {
      name: "rgb(0,0,0)",
      connections: "rgb(0,0,0)",
      section_titles: "rgb(0,0,0)",
      headline: "rgb(0,0,0)",
      links: "rgb(0,0,0)",
    },
    links: {
      underline: true,
    },
    section_titles: {
      type: "with_full_line",
    },
    sections: {
      show_time_spans_in: [],
    },
    header: {
      connections: {
        hyperlink: true,
        show_icons: false,
        display_urls_instead_of_usernames: true,
        separator: "•",
      },
    },
    entries: {
      short_second_row: false,
      highlights: {
        bullet: "◦",
        nested_bullet: "◦",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION**\n*DEGREE* *in* *AREA*\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "*LOCATION*\n*DATE*",
      },
      normal_entry: {
        date_and_location_column: "*LOCATION*\n*DATE*",
      },
      experience_entry: {
        main_column: "**POSITION**\n*COMPANY*\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "*LOCATION*\n*DATE*",
      },
    },
  },

  engineeringresumes: {
    page: {
      show_footer: false,
    },
    typography: {
      font_family: {
        body: "XCharter",
        name: "XCharter",
        headline: "XCharter",
        connections: "XCharter",
        section_titles: "XCharter",
      },
      font_size: {
        name: "25pt",
        section_titles: "1.2em",
      },
      bold: {
        name: false,
      },
    },
    header: {
      connections: {
        separator: "|",
        show_icons: false,
        display_urls_instead_of_usernames: true,
      },
    },
    colors: {
      name: "rgb(0,0,0)",
      connections: "rgb(0,0,0)",
      headline: "rgb(0,0,0)",
      section_titles: "rgb(0,0,0)",
      links: "rgb(0,0,0)",
    },
    links: {
      underline: true,
    },
    section_titles: {
      type: "with_full_line",
      space_above: "0.5cm",
      space_below: "0.3cm",
    },
    sections: {
      space_between_regular_entries: "0.42cm",
      space_between_text_based_entries: "0.15cm",
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: false,
      side_space: "0cm",
      summary: { space_above: "0.08cm" },
      highlights: {
        bullet: "●",
        nested_bullet: "●",
        space_left: "0cm",
        space_above: "0.08cm",
        space_between_items: "0.08cm",
        space_between_bullet_and_text: "0.3em",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },

  engineeringclassic: {
    typography: {
      font_family: {
        body: "Raleway",
        name: "Raleway",
        headline: "Raleway",
        connections: "Raleway",
        section_titles: "Raleway",
      },
      bold: {
        name: false,
        section_titles: false,
      },
    },
    header: {
      alignment: "left",
    },
    links: {
      show_external_link_icon: false,
    },
    section_titles: {
      type: "with_full_line",
    },
    sections: {
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: false,
      summary: { space_above: "0.12cm" },
      highlights: {
        space_left: "0cm",
        space_above: "0.12cm",
        space_between_items: "0.12cm",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },

  harvard: {
    page: {
      top_margin: "0.5in",
      bottom_margin: "0.5in",
      left_margin: "0.5in",
      right_margin: "0.5in",
      show_top_note: false,
    },
    colors: {
      name: "rgb(0,0,0)",
      headline: "rgb(0,0,0)",
      connections: "rgb(0,0,0)",
      section_titles: "rgb(0,0,0)",
      links: "rgb(0,0,0)",
    },
    typography: {
      font_family: {
        body: "XCharter",
        name: "XCharter",
        headline: "XCharter",
        connections: "XCharter",
        section_titles: "XCharter",
      },
      font_size: {
        name: "25pt",
        connections: "9pt",
        section_titles: "1.3em",
      },
    },
    header: {
      space_below_name: "0.5cm",
      space_below_headline: "0.5cm",
      space_below_connections: "0.5cm",
      connections: {
        show_icons: false,
        separator: "•",
        space_between_connections: "0.4cm",
      },
    },
    section_titles: {
      type: "centered_with_centered_partial_line",
      space_below: "0.2cm",
    },
    sections: {
      space_between_regular_entries: "1em",
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: false,
    },
    templates: {
      time_span: "",
      education_entry: {
        main_column: "**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**COMPANY**, POSITION -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },

  ink: {
    page: {
      top_margin: "0.6in",
      bottom_margin: "0.6in",
      left_margin: "0.6in",
      right_margin: "0.6in",
    },
    typography: {
      line_spacing: "0.55em",
      alignment: "justified",
      font_family: {
        body: "EB Garamond",
        name: "EB Garamond",
        headline: "EB Garamond",
        connections: "EB Garamond",
        section_titles: "EB Garamond",
      },
      font_size: {
        body: "10pt",
        name: "32pt",
        headline: "11pt",
        connections: "10pt",
        section_titles: "1.4em",
      },
      small_caps: {
        name: false,
        headline: false,
        section_titles: true,
      },
      bold: {
        name: true,
        headline: false,
        connections: false,
        section_titles: true,
      },
    },
    colors: {
      name: "rgb(42, 24, 82)",
      headline: "rgb(42, 24, 82)",
      connections: "rgb(70, 50, 110)",
      section_titles: "rgb(42, 24, 82)",
      links: "rgb(42, 24, 82)",
      footer: "rgb(120, 100, 140)",
      top_note: "rgb(120, 100, 140)",
    },
    header: {
      alignment: "left",
      space_below_name: "0.5cm",
      space_below_headline: "0.4cm",
      space_below_connections: "0.5cm",
      connections: {
        separator: "|",
        show_icons: false,
        display_urls_instead_of_usernames: true,
        space_between_connections: "0.4cm",
      },
    },
    links: {
      underline: true,
    },
    section_titles: {
      type: "without_line",
      space_above: "0.5cm",
      space_below: "0.2cm",
    },
    sections: {
      space_between_regular_entries: "1em",
      space_between_text_based_entries: "0.2em",
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: false,
      side_space: "0cm",
      space_between_columns: "0.2cm",
      summary: { space_above: "0.06cm" },
      highlights: {
        bullet: "•",
        nested_bullet: "•",
        space_left: "0cm",
        space_above: "0.06cm",
        space_between_items: "0.06cm",
        space_between_bullet_and_text: "0.4em",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION** -- LOCATION\n*DEGREE_WITH_AREA*\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**COMPANY** -- LOCATION\n*POSITION*\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },

  opal: {
    page: {
      top_margin: "0.65in",
      bottom_margin: "0.65in",
      left_margin: "0.65in",
      right_margin: "0.65in",
      show_footer: false,
      show_top_note: false,
    },
    typography: {
      line_spacing: "0.6em",
      alignment: "left",
      font_family: {
        body: "Lato",
        name: "Lato",
        headline: "Lato",
        connections: "Lato",
        section_titles: "Lato",
      },
      font_size: {
        body: "10pt",
        name: "26pt",
        headline: "10pt",
        connections: "9pt",
        section_titles: "1.2em",
      },
      small_caps: {
        name: false,
        headline: true,
        connections: false,
        section_titles: true,
      },
      bold: {
        name: true,
        headline: false,
        connections: false,
        section_titles: false,
      },
    },
    colors: {
      name: "rgb(0, 100, 90)",
      headline: "rgb(0, 80, 72)",
      connections: "rgb(0, 80, 72)",
      section_titles: "rgb(0, 100, 90)",
      links: "rgb(0, 100, 90)",
      footer: "rgb(100, 140, 135)",
      top_note: "rgb(100, 140, 135)",
    },
    header: {
      alignment: "center",
      space_below_name: "0.3cm",
      space_below_headline: "0.3cm",
      space_below_connections: "0.6cm",
      connections: {
        separator: "•",
        show_icons: true,
        space_between_connections: "0.5cm",
      },
    },
    links: {
      underline: false,
    },
    section_titles: {
      type: "centered_without_line",
      line_thickness: "0.4pt",
      space_above: "0.55cm",
      space_below: "0.25cm",
    },
    sections: {
      space_between_regular_entries: "1.1em",
      space_between_text_based_entries: "0.3em",
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: true,
      side_space: "0.15cm",
      space_between_columns: "0.1cm",
      summary: { space_above: "0.04cm" },
      highlights: {
        bullet: "◦",
        nested_bullet: "◦",
        space_left: "0.15cm",
        space_above: "0.04cm",
        space_between_items: "0.04cm",
        space_between_bullet_and_text: "0.5em",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION** -- LOCATION\nDEGREE_WITH_AREA\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**COMPANY**, *POSITION* -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },

  ember: {
    page: {
      top_margin: "0.6in",
      bottom_margin: "0.6in",
      left_margin: "0.6in",
      right_margin: "0.6in",
    },
    typography: {
      line_spacing: "0.6em",
      alignment: "justified-with-no-hyphenation",
      font_family: {
        body: "Ubuntu",
        name: "Gentium Book Plus",
        headline: "Gentium Book Plus",
        connections: "Ubuntu",
        section_titles: "Ubuntu",
      },
      font_size: {
        body: "10pt",
        name: "30pt",
        headline: "10.5pt",
        connections: "9pt",
        section_titles: "1.25em",
      },
      small_caps: {
        name: false,
        headline: true,
        connections: false,
        section_titles: true,
      },
      bold: {
        name: true,
        headline: false,
        connections: false,
        section_titles: false,
      },
    },
    colors: {
      body: "rgb(35, 31, 32)",
      name: "rgb(155, 35, 25)",
      headline: "rgb(90, 60, 55)",
      connections: "rgb(100, 75, 68)",
      section_titles: "rgb(155, 35, 25)",
      links: "rgb(155, 35, 25)",
      footer: "rgb(140, 125, 118)",
      top_note: "rgb(140, 125, 118)",
    },
    header: {
      alignment: "center",
      space_below_name: "0.5cm",
      space_below_headline: "0.4cm",
      space_below_connections: "0.6cm",
      connections: {
        separator: "·",
        show_icons: false,
        space_between_connections: "0.5cm",
      },
    },
    links: {
      underline: true,
    },
    section_titles: {
      type: "centered_without_line",
      line_thickness: "0.5pt",
      space_above: "0.55cm",
      space_below: "0.25cm",
    },
    sections: {
      space_between_regular_entries: "1.1em",
      space_between_text_based_entries: "0.3em",
      show_time_spans_in: [],
    },
    entries: {
      short_second_row: false,
      side_space: "0.1cm",
      space_between_columns: "0.15cm",
      summary: { space_above: "0.05cm" },
      highlights: {
        bullet: "◆",
        nested_bullet: "◦",
        space_left: "0.15cm",
        space_above: "0.05cm",
        space_between_items: "0.04cm",
        space_between_bullet_and_text: "0.5em",
      },
    },
    templates: {
      education_entry: {
        main_column: "**INSTITUTION** -- LOCATION\n*DEGREE_WITH_AREA*\nSUMMARY\nHIGHLIGHTS",
        degree_column: null,
        date_and_location_column: "DATE",
      },
      normal_entry: {
        main_column: "**NAME** -- LOCATION\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
      experience_entry: {
        main_column: "**COMPANY** -- LOCATION\n*POSITION*\nSUMMARY\nHIGHLIGHTS",
        date_and_location_column: "DATE",
      },
    },
  },
};

/**
 * Deep-merge two objects. Values in `override` take precedence over `base`.
 * Arrays are replaced entirely (not merged element-wise).
 */
function deepMerge(base: DesignDefaults, override: DesignDefaults): DesignDefaults {
  const result: DesignDefaults = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as DesignDefaults,
        value as DesignDefaults,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Get the full design defaults for a given theme.
 *
 * Deep-merges the theme-specific overrides with the classic defaults.
 * For "classic", returns the classic defaults directly.
 */
export function getThemeDefaults(theme: ThemeName): DesignDefaults {
  if (theme === "classic") {
    return { ...classicDefaults, theme: "classic" };
  }
  const overrides = themeOverrides[theme] ?? {};
  const merged = deepMerge(classicDefaults, overrides);
  return { ...merged, theme };
}
