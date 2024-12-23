# QMK Setup

`rules.mk`
```makefile
CONSOLE_ENABLE = yes
```

`keymap.c`
```c
bool pre_process_record_user(uint16_t keycode, keyrecord_t *record) {
    uprintf("#0>%d %d %d %d\n", record->event.key.col, record->event.key.row, record->event.pressed, record->tap.count);
    return true;
}

bool process_record_user(uint16_t keycode, keyrecord_t *record) {
    uprintf("#1>%d %d %d %d %d\n", keycode, record->event.key.col, record->event.key.row, record->event.pressed, record->tap.count);
    return true;
}

layer_state_t layer_state_set_user(layer_state_t state) {
    uprintf("#2>%d\n", state);
    return state;
}
```