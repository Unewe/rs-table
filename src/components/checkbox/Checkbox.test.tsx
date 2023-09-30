import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Checkbox } from "../index";

describe("Checkbox", () => {

  it("По умолчанию не выбран", async() => {
    render(<Checkbox />);
    expect(screen.getByTestId("checkbox").parentElement?.classList.contains("rs-unchecked")).toBe(true);
  });

  it("Выбирается", async () => {
    render(<Checkbox />);

    act(() => {
      fireEvent.click(screen.getByTestId("checkbox"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("checkbox").parentElement?.classList.contains("rs-checked")).toBe(true);
    });
  });

  it("Disabled", async () => {
    render(<Checkbox disabled={true} />);

    await waitFor(() => {
      expect(screen.getByTestId("checkbox").parentElement?.classList.contains("rs-disabled")).toBe(true);
    });
  });
});
