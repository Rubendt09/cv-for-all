/**
 * Component tests for the CV form.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CvForm } from "@/components/Form/CvForm";
import { useCvStore } from "@/store/cvStore";
import exampleYaml from "@/examples/example-cv.yaml?raw";

function resetStore(yaml: string) {
  useCvStore.setState({
    yamlString: yaml,
    errors: [],
    isValid: false,
    externalYamlRevision: useCvStore.getState().externalYamlRevision + 1,
  });
}

describe("CvForm", () => {
  beforeEach(() => {
    resetStore(exampleYaml);
  });

  it("renders the header card with the CV name", () => {
    const result = render(<CvForm />);
    // The BasicsCard is open by default and shows the name field
    expect(screen.getByDisplayValue("John Doe")).toBeTruthy();
    result.unmount();
  });

  it("updates yamlString when the name is edited", () => {
    const result = render(<CvForm />);
    const input = screen.getByDisplayValue("John Doe") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jane Doe" } });
    // The store should have been updated
    expect(useCvStore.getState().yamlString).toContain("Jane Doe");
    result.unmount();
  });

  it("shows a banner for invalid YAML instead of the form", () => {
    resetStore("cv:\n  name: John\n  bad: : :");
    const result = render(<CvForm />);
    expect(screen.getByText(/Switch to YAML editor/i)).toBeTruthy();
    result.unmount();
  });

  it("renders sections from the example", () => {
    const result = render(<CvForm />);
    // Sections card is open by default; section titles should appear
    expect(screen.getByText("Summary")).toBeTruthy();
    expect(screen.getByText("Experience")).toBeTruthy();
    expect(screen.getByText("Education")).toBeTruthy();
    result.unmount();
  });

  it("renders the PDF Design card and writes design options to the YAML", () => {
    const result = render(<CvForm />);
    // The design card is collapsed by default — open it
    fireEvent.click(screen.getByText("PDF Design"));
    // The Page group is open by default; "Show footer" defaults to true
    const checkbox = screen
      .getByText("Show footer")
      .closest("label")!
      .querySelector("input")! as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(useCvStore.getState().yamlString).toContain("show_footer: false");
    result.unmount();
  });

  it("changes the theme from the design card", () => {
    const result = render(<CvForm />);
    fireEvent.click(screen.getByText("PDF Design"));
    // First combobox in the card is the theme selector
    const themeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(themeSelect, { target: { value: "ink" } });
    expect(useCvStore.getState().yamlString).toContain("theme: ink");
    result.unmount();
  });
});
